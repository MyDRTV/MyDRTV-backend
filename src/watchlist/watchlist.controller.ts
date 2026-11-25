import {Controller, Get, Post, Req, UseGuards, Body, Delete, Param, HttpCode, HttpStatus,} from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlist } from './dto/create-watchlist.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('/watchlist')
@UseGuards(RolesGuard)
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}


  // ------------------ GET watchlist by user ------------------//

  @Get()
  @Roles('user')
  @HttpCode(HttpStatus.OK)
  findMine(@Req() request: { user: { sub: string } }) {
    const userPk = request.user.sub;

    return this.watchlistService.findByUser(userPk);
  }

  
  // ------------------ Add movie to watchlist ------------------//

  @Post()
  @Roles('user')
  @HttpCode(HttpStatus.CREATED)
  addMovie(
    @Body() dto: CreateWatchlist,
    @Req() request: { user: { sub: string } },
  ) {
    const userPk = request.user.sub;

    return this.watchlistService.addMovie(userPk, dto.moviePk);
  }


  // ------------------ Delete movie from watchlist ------------------//

  @Delete(':id')
  @Roles('user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') watchlistPk: string,
    @Req() request: { user: { sub: string } },
  ): Promise<void> {
    const userPk = request.user.sub;

    await this.watchlistService.deleteMovieFromWatchlist(watchlistPk, userPk);
  }
}
