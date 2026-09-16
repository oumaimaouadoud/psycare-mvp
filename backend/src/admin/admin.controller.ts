import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard.js';
import { AdminService } from './admin.service.js';
import {
  CreateBlockedPeriodDto,
  ReplaceAvailabilityRulesDto,
  UpdateAppointmentStatusDto,
} from './admin.dto.js';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('appointments')
  appointments(@Query('from') from?: string, @Query('to') to?: string) {
    return this.admin.listAppointments(from, to);
  }

  @Patch('appointments/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.admin.updateAppointmentStatus(id, dto.status);
  }

  @Get('availability-rules')
  rules() {
    return this.admin.getAvailabilityRules();
  }

  @Put('availability-rules')
  replaceRules(@Body() dto: ReplaceAvailabilityRulesDto) {
    return this.admin.replaceAvailabilityRules(dto.rules);
  }

  @Get('blocked-periods')
  blocked() {
    return this.admin.listBlockedPeriods();
  }

  @Post('blocked-periods')
  createBlocked(@Body() dto: CreateBlockedPeriodDto) {
    return this.admin.createBlockedPeriod(dto);
  }

  @Delete('blocked-periods/:id')
  deleteBlocked(@Param('id') id: string) {
    return this.admin.deleteBlockedPeriod(id);
  }
}
