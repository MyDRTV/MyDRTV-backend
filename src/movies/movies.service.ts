import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';
import { randomUUID } from 'node:crypto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Rating } from '../ratings/entity/rating.entity';

type MovieWithAverageRating = Movie & { averageRating: number | null };

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,

    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  //------------------ GET all movies ------------------//

  async findAll(): Promise<MovieWithAverageRating[]> {
    const movies = await this.moviesRepository.find({
      relations: {
        genres: true,
      },
      order: {
        movie_title: 'ASC',
      },
    });
    return this.withAverageRatings(movies);
  }

  //------------------ GET movie by id ------------------//

  async findOne(moviePk: string): Promise<MovieWithAverageRating> {
    const movie = await this.findMovieById(moviePk);
    const averageRating = await this.ratingRepository.average('rating', {
      movie: { movie_pk: moviePk },
    });

    return { ...movie, averageRating };
  }

  async findMovieById(moviePk: string): Promise<Movie> {
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
    const movie = await this.findMovieById(moviePk);
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
    const movie = await this.findMovieById(moviePk);
    await this.moviesRepository.remove(movie);
  }

  // ------------------ FILTER movie by genre ------------------//

  async filterByGenre(genre: string): Promise<MovieWithAverageRating[]> {
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

    return this.withAverageRatings(movies);
  }

  // ------------------ SEARCH movie by title ------------------//

  async searchByTitle(title: string): Promise<MovieWithAverageRating[]> {
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

    return this.withAverageRatings(movies);
  }

  private async withAverageRatings(
    movies: Movie[],
  ): Promise<MovieWithAverageRating[]> {
    if (movies.length === 0) return [];

    const moviePks = movies.map((movie) => movie.movie_pk);
    const ratings = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('rating.movie', 'moviePk')
      .addSelect('AVG(rating.rating)', 'averageRating')
      .where('rating.movie = ANY(:moviePks)', { moviePks })
      .groupBy('rating.movie')
      .getRawMany<{ moviePk: string; averageRating: string }>();

    const averages = new Map(
      ratings.map(({ moviePk, averageRating }) => [
        moviePk,
        Number(averageRating),
      ]),
    );

    return movies.map((movie) => ({
      ...movie,
      averageRating: averages.get(movie.movie_pk) ?? null,
    }));
  }
}
