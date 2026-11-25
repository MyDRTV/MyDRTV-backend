import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';
import { randomUUID } from 'node:crypto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  //------------------ GET all movies ------------------//
  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find({
      order: {
        movie_title: 'ASC',
      },
    });
  }

  //------------------ GET movie by id ------------------//
  async findOne(moviePk: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { movie_pk: moviePk },
    });
    if (!movie) {
      throw new NotFoundException('Filmen blev ikke fundet');
    }
    return movie;
  }

  //------------------ POST new movie by id ------------------//
  async create(dto: CreateMovieDto): Promise<Movie> {
    const movie = this.moviesRepository.create({
      movie_pk: randomUUID().replace(/-/g, ''),
      movie_title: dto.title,
      movie_description: dto.description,
      movie_release_year: dto.release_year.toString(),
      movie_poster_url: dto.poster_url,
    });

    return this.moviesRepository.save(movie);
  }

  //------------------ UPDATE movie by id ------------------//
  async update(moviePk: string, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(moviePk);
    // Object.assign(movie, dto);

    if (typeof dto.release_year === 'number') {
      movie.movie_release_year = dto.release_year.toString();
    }
    if (typeof dto.title === 'string') {
      movie.movie_title = dto.title;
    }
    if (typeof dto.description === 'string') {
      movie.movie_description = dto.description;
    }
    if (typeof dto.poster_url === 'string') {
      movie.movie_poster_url = dto.poster_url;
    }
    return this.moviesRepository.save(movie);
  }

  //------------------ DELETE movie by id ------------------//
  async remove(moviePk: string): Promise<void> {
    const movie = await this.findOne(moviePk);
    await this.moviesRepository.remove(movie);
  }

  // findByMovie(moviePk: string): Promise<Movie[]> {
  //   return this.moviesRepository.find({
  //     where: { movie_pk: moviePk },
  //   });
  // }
}
