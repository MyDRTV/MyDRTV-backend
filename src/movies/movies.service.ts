import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find({
      order: {
        movie_title: 'ASC',
      },
    });
  }

  async findOne(moviePk: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { movie_pk: moviePk },
    });
    if (!movie) {
      throw new NotFoundException('Filmen blev ikke fundet');
    }
    return movie;
  }

  findByMovie(moviePk: string): Promise<Movie[]> {
    return this.moviesRepository.find({
      where: { movie_pk: moviePk },
    });
  }
}
