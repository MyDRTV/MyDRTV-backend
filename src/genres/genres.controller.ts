import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';

import { GenresService } from './genres.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateGenre } from './dto/create-genre.dto';

@Controller('/genres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GenresController {

  constructor(private readonly genresService: GenresService) {}

  //------------------ GET all genres ------------------//
  @Get()
  @Roles('admin')
  findAll() {
    return this.genresService.findAll();
  }

  //------------------ POST new genre ------------------//
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateGenre) {
    return this.genresService.create(dto);
  }
}