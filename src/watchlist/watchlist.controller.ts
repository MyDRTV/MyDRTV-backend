import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
  Body,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchlistService } from './watchlist.service';
import { CreateWatchlist } from './dto/create-watchlist.dto';

@Controller('api/watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findMine(@Req() request: { user?: { sub?: string } }) {
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new UnauthorizedException();
    }

    return this.watchlistService.findByUser(userPk);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
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
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
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
