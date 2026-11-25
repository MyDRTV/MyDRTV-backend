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
  create(@Body() dto: any) {
    return this.moviesService.create(dto);
  }

  //------------------ PATCH movie by id ------------------//
  @Patch(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') moviePk: string, @Body() dto: any) {
    return this.moviesService.update(moviePk, dto);
  }

  //------------------ DELETE movie by id ------------------//
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') moviePk: string) {
    return this.moviesService.remove(moviePk);
  }
}
