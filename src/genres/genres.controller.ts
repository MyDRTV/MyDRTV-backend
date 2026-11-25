import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';

import { GenresService } from './genres.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateGenre } from './dto/create-genre.dto';

@Controller('/genres')
@UseGuards(RolesGuard)
export class GenresController {

  constructor(private readonly genresService: GenresService) {}

  //------------------ GET all genres ------------------//
  @Get()
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.genresService.findAll();
  }

  //------------------ POST new genre ------------------//
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGenre) {
    return this.genresService.create(dto);
  }
}