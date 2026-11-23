import {Body, Controller, Get, Param, Patch, Delete, Post, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MoviesService } from './movies.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
@Controller('/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
  ) {}

  //------------------ GET all movies ------------------//
  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.moviesService.findAll();
  }

  //------------------ GET movie by id ------------------//
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') moviePk: string) {
    return this.moviesService.findOne(moviePk);
  }

  //=========================== ADMIN ROUTES ===========================//

  //------------------ POST new movie ------------------//
  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: any) {
    return this.moviesService.create(dto);
  }

  //------------------ PATCH movie by id ------------------//
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') moviePk: string, @Body() dto: any) {
    return this.moviesService.update(moviePk, dto);
  }

  //------------------ DELETE movie by id ------------------//
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') moviePk: string) {
    return this.moviesService.remove(moviePk);
  }
}
