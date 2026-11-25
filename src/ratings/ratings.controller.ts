import {Body, Controller, Delete, Get, Post, Param, Patch, Req, UseGuards, HttpCode, HttpStatus} from '@nestjs/common';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { CreateRatingDto } from './dto/create-rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MoviesService } from '../movies/movies.service';

@Controller('/ratings')
@UseGuards(RolesGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService, private readonly moviesService: MoviesService) {}

  //------------------ GET ratings for a movie ------------------//

  @Get(':id/ratings')
  @Roles('user')
  async findRatings(@Param('id') moviePk: string) {
    await this.moviesService.findOne(moviePk);
    return this.ratingsService.findByMovie(moviePk);
  }

  //------------------ POST rating for a movie ------------------//
  @Roles('user')
  @Post(':id/ratings')
  async createRating(
    @Param('id') moviePk: string,
    @Body() dto: CreateRatingDto,
    @Req() request: { user: { sub: string } },
  ) {
    const userPk = request.user.sub;

    const movie = await this.moviesService.findOne(moviePk);

    return this.ratingsService.create(movie, userPk, dto.rating);
  }


  //------------------  UPDATE rating ------------------//
  @Roles('user')
  @Patch(':id')
  update(
    @Param('id') ratingPk: string,
    @Body() dto: UpdateRatingDto,
    @Req() request: { user: { sub: string } },
  ) {
    const userPk = request.user.sub;

    return this.ratingsService.updateRating(ratingPk, userPk, dto.rating);
  }

    //------------------  DELETE rating ------------------//
  @Roles('user')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') ratingPk: string,
    @Req() request: { user: { sub: string } },
  ): Promise<void> {
    const userPk = request.user.sub;

    await this.ratingsService.deleteRating(ratingPk, userPk);
  }
}
