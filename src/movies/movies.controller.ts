import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ValidationPipe,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateRatingDto } from '../ratings/dto/create-rating.dto';
import { RatingsService } from '../ratings/ratings.service';
import { MoviesService } from './movies.service';

@Controller('api/movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly ratingsService: RatingsService,
  ) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') moviePk: string) {
    return this.moviesService.findOne(moviePk);
  }

  @Get(':id/ratings')
  async findRatings(@Param('id') moviePk: string) {
    await this.moviesService.findOne(moviePk);
    return this.ratingsService.findByMovie(moviePk);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/ratings')
  async createRating(
    @Param('id') moviePk: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateRatingDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    const movie = await this.moviesService.findOne(moviePk);

    return this.ratingsService.create(movie, userPk, dto.rating);
  }

  //---------------ADMIN----------------
}
