import { Controller, Get } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly WatchlistService: WatchlistService) {}

  @Get()
  findAll() {
    return this.WatchlistService.findAll();
  }
}
