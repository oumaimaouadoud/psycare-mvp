import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AppointmentStatus } from '../generated/prisma/enums.js';
import type { AvailabilityRuleDto, CreateBlockedPeriodDto } from './admin.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listAppointments(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.startAt = {};
      if (from) where.startAt.gte = new Date(from);
      if (to) where.startAt.lte = new Date(to);
    }

    return this.prisma.appointment.findMany({
      where,
      orderBy: { startAt: 'asc' },
      select: {
        id: true,
        patientName: true,
        phone: true,
        email: true,
        startAt: true,
        endAt: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Rendez-vous introuvable');

    const freesSlot = status === 'CANCELLED';
    const needsSlot = status !== 'CANCELLED' && !existing.activeSlotKey;

    try {
      return await this.prisma.appointment.update({
        where: { id },
        data: {
          status,
          activeSlotKey: freesSlot
            ? null
            : needsSlot
              ? DateTime.fromJSDate(existing.startAt).toUTC().toISO()
              : existing.activeSlotKey,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Le créneau a déjà été réattribué à un autre patient.');
      }
      throw error;
    }
  }

  getAvailabilityRules() {
    return this.prisma.availabilityRule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async replaceAvailabilityRules(rules: AvailabilityRuleDto[]) {
    for (const rule of rules) {
      if (rule.startTime >= rule.endTime) {
        throw new BadRequestException('Une heure de début doit précéder l’heure de fin.');
      }
    }

     const rulesByDay = new Map<number, AvailabilityRuleDto[]>();

for (const rule of rules) {
  const current = rulesByDay.get(rule.dayOfWeek) ?? [];
  current.push(rule);
  rulesByDay.set(rule.dayOfWeek, current);
}

for (const [, dayRules] of rulesByDay) {
  const sorted = [...dayRules].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];

    if (current.startTime < previous.endTime) {
      throw new BadRequestException(
        `Deux plages horaires se chevauchent : ${previous.startTime}-${previous.endTime} et ${current.startTime}-${current.endTime}.`
      );
    }
  }
}
    return this.prisma.$transaction(async (tx) => {
      await tx.availabilityRule.deleteMany();
      if (rules.length > 0) await tx.availabilityRule.createMany({ data: rules });
      return tx.availabilityRule.findMany({
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    });
  }

  listBlockedPeriods() {
    return this.prisma.blockedPeriod.findMany({ orderBy: { startAt: 'asc' } });
  }

  async createBlockedPeriod(dto: CreateBlockedPeriodDto) {
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (startAt >= endAt) throw new BadRequestException('Période invalide');

    return this.prisma.blockedPeriod.create({
      data: { startAt, endAt, label: dto.label?.trim() || null },
    });
  }

  async deleteBlockedPeriod(id: string) {
    await this.prisma.blockedPeriod.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Période introuvable');
    });
    return { ok: true };
  }
}
