import {Body, Controller, Get, Param, Patch, Delete, Post, ValidationPipe, Req, UnauthorizedException, UseGuards,} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRatingDto } from '../ratings/dto/create-rating.dto';
import { RatingsService } from '../ratings/ratings.service';
import { MoviesService } from './movies.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly ratingsService: RatingsService,
  ) {}

  //------------------ GET all movies ------------------//
  @Get()
  @Roles('user', 'admin')
  findAll() {
    return this.moviesService.findAll();
  }

  //------------------ GET movie by id ------------------//
  @Get(':id')
  @Roles('user', 'admin')
  findOne(@Param('id') moviePk: string) {
    return this.moviesService.findOne(moviePk);
  }

  //------------------ GET ratings for a movie ------------------//
  @Get(':id/ratings')
  @Roles('user')
  async findRatings(@Param('id') moviePk: string) {
    await this.moviesService.findOne(moviePk);
    return this.ratingsService.findByMovie(moviePk);
  }

  //------------------ POST rating for a movie ------------------//
  @UseGuards(JwtAuthGuard)
  @Roles('user')
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

  //=========================== ADMIN ROUTES ===========================//

  //------------------ POST new movie ------------------//
  @Post()
  @Roles('admin')
  create(@Body() dto: any) {
    return this.moviesService.create(dto);
  }

  //------------------ PATCH movie by id ------------------//
  @Patch(':id')
  @Roles('admin')
  update(@Param('id') moviePk: string, @Body() dto: any) {
    return this.moviesService.update(moviePk, dto);
  }

  //------------------ DELETE movie by id ------------------//
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') moviePk: string) {
    return this.moviesService.remove(moviePk);
  }
}
