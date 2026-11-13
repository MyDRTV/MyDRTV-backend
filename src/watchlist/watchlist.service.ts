import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entity/watchlist.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
  ) {}

  findAll(): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      order: {
        movie_fk: 'ASC',
      },
    });
  }
}
