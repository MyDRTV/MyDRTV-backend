import { Controller, Get } from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
  constructor(private readonly GenresService: GenresService) {}

  @Get()
  findAll() {
    return this.GenresService.findAll();
  }
}
