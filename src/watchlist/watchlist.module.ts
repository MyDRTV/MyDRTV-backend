import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Watchlist } from './entity/watchlist.entity';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist]), AuthModule, MoviesModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
