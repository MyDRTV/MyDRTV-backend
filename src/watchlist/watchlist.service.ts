import { Injectable, ConflictException, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Watchlist } from './entity/watchlist.entity';
import { MoviesService } from '../movies/movies.service';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
    private readonly moviesService: MoviesService,
  ) {}


  //------------------ GET watchlist by user ------------------//

  findByUser(userPk: string): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { user_fk: userPk },
      relations: { movie: true },
      order: { movie_fk: 'ASC' },
    });
  }


  //------------------ GET watchlist by movie ------------------//

  findByMovie(moviePk: string): Promise<Watchlist[]> {
    return this.watchlistRepository.find({
      where: { movie_fk: moviePk },
      relations: { movie: true },
      order: { movie_fk: 'ASC' },
    });
  }


  //------------------ ADD movie to watchlist ------------------//

  async addMovie(userPk: string, moviePk: string) {
    const movie = await this.moviesService.findOne(moviePk);

    const entry = {
      user_fk: userPk,
      movie_fk: movie.movie_pk,
      watchlist_added_at: Date.now().toString(),
    };

    try {
      await this.watchlistRepository.insert(entry);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        error.driverError.code === '23505' // Unique violation error code for PostgreSQL
      ) {
        throw new ConflictException('Filmen er allerede på din watchlist');
      }

      throw error;
    }

    return { ...entry, movie };
  }


  //------------------ DELETE movie from watchlist ------------------//

  async deleteMovieFromWatchlist(userPk: string, moviePk: string): Promise<void> {
    const result = await this.watchlistRepository.delete({
      user_fk: userPk,
      movie_fk: moviePk,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Filmen blev ikke fundet på din watchlist');
    }
  }
}
