import { Controller, Get, Query } from '@nestjs/common';
import { IsDateString } from 'class-validator';
import { AvailabilityService } from './availability.service.js';

class AvailabilityQueryDto {
  @IsDateString()
  date!: string;
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get()
  async getSlots(@Query() query: AvailabilityQueryDto) {
    return this.availability.getSlots(query.date.slice(0, 10));
  }
}
