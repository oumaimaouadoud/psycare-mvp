import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '../prisma/prisma.service.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { CreateAppointmentDto } from './create-appointment.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const slot = await this.availability.assertSlotAvailable(dto.startAt);
    const start = DateTime.fromISO(slot.startAt, { zone: 'utc' });
    const end = DateTime.fromISO(slot.endAt, { zone: 'utc' });

    try {
      const appointment = await this.prisma.appointment.create({
        data: {
          patientName: dto.patientName.trim(),
          phone: dto.phone.trim(),
          email: dto.email?.trim().toLowerCase() || null,
          startAt: start.toJSDate(),
          endAt: end.toJSDate(),
          type: dto.type,
          status: 'PENDING',
          activeSlotKey: start.toISO()!,
        },
        select: { id: true, startAt: true, endAt: true, status: true, type: true },
      });

      return {
        ...appointment,
        message: 'Votre demande de rendez-vous a bien été enregistrée.',
      };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Ce créneau vient d’être réservé. Veuillez en choisir un autre.');
      }
      throw new BadRequestException('Impossible d’enregistrer le rendez-vous');
    }
  }
}
