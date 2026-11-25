import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';
import { randomUUID } from 'node:crypto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Genre } from '../genres/entity/genre.entity';
@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  //------------------ GET all movies ------------------//

  findAll(): Promise<Movie[]> {
    return this.moviesRepository.find({
      relations: {
        genres: true,
      },
      order: {
        movie_title: 'ASC',
      },
    });
  }

  //------------------ GET movie by id ------------------//

  async findOne(moviePk: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { movie_pk: moviePk },
      relations: {
        genres: true,
      },
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
    Object.assign(movie, dto);
    return this.moviesRepository.save(movie);
  }

  //------------------ DELETE movie by id ------------------//

  async remove(moviePk: string): Promise<void> {
    const movie = await this.findOne(moviePk);
    await this.moviesRepository.remove(movie);
  }


  // ------------------ FILTER movie by genre ------------------//

  async filterByGenre(genre: string): Promise<Movie[]> {

      const movies = await this.moviesRepository.find({
          where: {
              genres: {
                  genre_name: genre,
              },
          },
          relations: {
              genres: true,
          },
          order: {
              movie_title: 'ASC',
          },
      });

      if (movies.length === 0) {
          throw new NotFoundException('Ingen film fundet med denne genre');
      }

      return movies;
    }


    // ------------------ SEARCH movie by title ------------------//

    async searchByTitle(title: string): Promise<Movie[]> {
      const movies = await this.moviesRepository.find({
        where: {
          movie_title: title,
        },
        order: {
          movie_title: 'ASC',
        },
        relations: {
          genres: true,
        },
      });

      if (movies.length === 0) {
        throw new NotFoundException('Ingen film fundet med denne titel');
      }

      return movies;
    }
  }
