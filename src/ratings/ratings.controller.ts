import { Controller, Get } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly RatingsService: RatingsService) {}

  @Get()
  findAll() {
    return this.RatingsService.findAll();
  }
}
