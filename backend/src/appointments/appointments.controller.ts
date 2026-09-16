import { Body, Controller, Post } from '@nestjs/common';
import { CreateAppointmentDto } from './create-appointment.dto.js';
import { AppointmentsService } from './appointments.service.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }
}
