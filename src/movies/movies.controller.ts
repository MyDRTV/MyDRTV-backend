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
import { MoviesService } from './movies.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MovieIdDto } from './dto/movie-id.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
@Controller('/movies')
@UseGuards(RolesGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  //------------------ GET all movies ------------------//
  @Get()
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.moviesService.findAll();
  }

  //------------------ GET movie by id ------------------//
  @Get(':id')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  findOne(@Param() params: MovieIdDto) {
    return this.moviesService.findOne(params.id);
  }

  //------------------ FILTER movie by genre ------------------//
  @Get('filter-by-genre/:genre')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  filterByGenre(@Param('genre') genre: string) {
    return this.moviesService.filterByGenre(genre);
  }

  //------------------ SEARCH movie by title ------------------//
  @Get('search-by-title/:title')
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  searchByTitle(@Param('title') title: string) {
    return this.moviesService.searchByTitle(title);
  }

  //=========================== ADMIN ROUTES ===========================//

  //------------------ POST new movie ------------------//
  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  //------------------ PATCH movie by id ------------------//
  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(@Param() params: MovieIdDto, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(params.id, dto);
  }

  //------------------ DELETE movie by id ------------------//
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() params: MovieIdDto) {
    return this.moviesService.remove(params.id);
  }
}
