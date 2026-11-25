import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MoviesService } from './movies.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieIdDto } from './dto/movie-id.dto';
@Controller('/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

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
  findOne(@Param() params: MovieIdDto) {
    return this.moviesService.findOne(params.id);
  }

  //=========================== ADMIN ROUTES ===========================//

  //------------------ POST new movie ------------------//
  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  //------------------ PATCH movie by id ------------------//
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(@Param() params: MovieIdDto, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(params.id, dto);
  }

  //------------------ DELETE movie by id ------------------//
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() params: MovieIdDto) {
    return this.moviesService.remove(params.id);
  }
}
