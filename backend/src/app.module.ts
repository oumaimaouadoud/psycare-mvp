import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AvailabilityModule } from './availability/availability.module.js';
import { AdminModule } from './admin/admin.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    AvailabilityModule,
    AppointmentsModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
