import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from './entity/watchlist.entity';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist])],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}