import {Body, Controller, Delete, Get, Param, Patch, Req, UnauthorizedException, UseGuards, ValidationPipe, HttpCode, HttpStatus} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
@Controller('/ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('user')
  @Patch(':id')
  update(
    @Param('id') ratingPk: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: UpdateRatingDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    return this.ratingsService.updateRating(ratingPk, userPk, dto.rating);
  }

  @UseGuards(JwtAuthGuard)
  @Roles('user')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') ratingPk: string,
    @Req() request: { user?: { sub?: string } },
  ): Promise<void> {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    await this.ratingsService.deleteRating(ratingPk, userPk);
  }
}
