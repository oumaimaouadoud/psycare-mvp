import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service.js';

export type Slot = {
  startAt: string;
  endAt: string;
  label: string;
};

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private get timezone() {
    return process.env.CLINIC_TIMEZONE ?? 'Africa/Casablanca';
  }

  async getSlots(date: string): Promise<{ date: string; timezone: string; slots: Slot[] }> {
    const localDate = DateTime.fromISO(date, { zone: this.timezone }).startOf('day');
    if (!localDate.isValid) throw new BadRequestException('Date invalide');

    const now = DateTime.now().setZone(this.timezone);
    if (localDate.endOf('day') < now) return { date, timezone: this.timezone, slots: [] };

    const rules = await this.prisma.availabilityRule.findMany({
      where: { dayOfWeek: localDate.weekday, active: true },
      orderBy: { startTime: 'asc' },
    });

    const dayStartUtc = localDate.toUTC().toJSDate();
    const dayEndUtc = localDate.endOf('day').toUTC().toJSDate();

    const [appointments, blocked] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          startAt: { gte: dayStartUtc, lte: dayEndUtc },
          status: { not: 'CANCELLED' },
        },
        select: { startAt: true, endAt: true },
      }),
      this.prisma.blockedPeriod.findMany({
        where: {
          startAt: { lt: dayEndUtc },
          endAt: { gt: dayStartUtc },
        },
        select: { startAt: true, endAt: true },
      }),
    ]);

    const collides = (start: DateTime, end: DateTime) => {
      const s = start.toUTC().toMillis();
      const e = end.toUTC().toMillis();
      const periods = [...appointments, ...blocked];
      return periods.some((p) => s < p.endAt.getTime() && e > p.startAt.getTime());
    };

    const slots: Slot[] = [];
    for (const rule of rules) {
      let cursor = DateTime.fromISO(`${date}T${rule.startTime}`, { zone: this.timezone });
      const limit = DateTime.fromISO(`${date}T${rule.endTime}`, { zone: this.timezone });

      while (cursor.plus({ minutes: rule.slotMinutes }) <= limit) {
        const end = cursor.plus({ minutes: rule.slotMinutes });
        if (cursor > now && !collides(cursor, end)) {
          slots.push({
            startAt: cursor.toUTC().toISO()!,
            endAt: end.toUTC().toISO()!,
            label: cursor.toFormat('HH:mm'),
          });
        }
        cursor = end;
      }
    }

    const uniqueSlots = Array.from(
  new Map(
    slots.map((slot) => [slot.startAt, slot])
  ).values()
).sort(
  (a, b) =>
    new Date(a.startAt).getTime() -
    new Date(b.startAt).getTime()
);

return {
  date,
  timezone: this.timezone,
  slots: uniqueSlots,
};
  }

  async assertSlotAvailable(startAtIso: string) {
    const startUtc = DateTime.fromISO(startAtIso, { zone: 'utc' });
    if (!startUtc.isValid) throw new BadRequestException('Créneau invalide');
    const localDate = startUtc.setZone(this.timezone).toISODate();
    if (!localDate) throw new BadRequestException('Créneau invalide');
    const result = await this.getSlots(localDate);
    const found = result.slots.find((slot) => slot.startAt === startUtc.toUTC().toISO());
    if (!found) throw new BadRequestException('Ce créneau n’est plus disponible');
    return found;
  }
}
