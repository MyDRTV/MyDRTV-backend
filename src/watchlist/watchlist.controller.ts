import {Controller, Get, Post, Req, UnauthorizedException, UseGuards, ValidationPipe, Body, Delete, Param, HttpCode, HttpStatus,} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlist } from './dto/create-watchlist.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
@Controller('/watchlist')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}


  // ------------------ GET watchlist by user ------------------//

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles('user')
  findMine(@Req() request: { user?: { sub?: string } }) {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    return this.watchlistService.findByUser(userPk);
  }

  
  // ------------------ Add movie to watchlist ------------------//

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles('user')
  addMovie(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreateWatchlist,
    @Req() request: { user?: { sub?: string } },
  ) {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    return this.watchlistService.addMovie(userPk, dto.moviePk);
  }


  // ------------------ Delete movie from watchlist ------------------//

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles('user')
  @HttpCode(HttpStatus.NO_CONTENT)

  async remove(
    @Param('id') watchlistPk: string,
    @Req() request: { user?: { sub?: string } },
  ): Promise<void> {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    await this.watchlistService.deleteWatchlist(watchlistPk, userPk);
  }
}
