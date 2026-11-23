import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../movies/entity/movie.entity';
import { User } from '../users/entity/user.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from './entity/rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}


  //-------------------  CREATE rating ------------------//

  async create(movie: Movie, userId: string, rating: number) {
    const user = await this.userRepository.findOne({
      where: { user_pk: userId },
      select: { user_pk: true },
    });

    if (!user) {
      throw new NotFoundException('Brugeren blev ikke fundet');
    }

    const newRating = this.ratingRepository.create({
      rating_pk: randomUUID().replaceAll('-', ''),
      movie,
      user,
      rating,
    });

    await this.ratingRepository.insert(newRating);

    return {
      rating_pk: newRating.rating_pk,
      moviePk: movie.movie_pk,
      userId,
      rating: newRating.rating,
    };
  }


  //------------------  GET all ratings ------------------//

  findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({
      order: {
        rating: 'ASC',
      },
    });
  }


  //------------------  FIND ratings by movie ------------------//

  findByMovie(moviePk: string): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: {
        movie: {
          movie_pk: moviePk,
        },
      },
    });
  }


  //------------------  UPDATE rating ------------------//

  async updateRating(ratingPk: string, userPk: string, rating: number) {
    const result = await this.ratingRepository
      .createQueryBuilder()
      .update(Rating)
      .set({ rating })
      .where('rating_pk = :ratingPk AND user_fk = :userPk', {
        ratingPk,
        userPk,
      })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Ratingen blev ikke fundet');
    }

    return { rating_pk: ratingPk, rating };
  }


  //------------------  DELETE rating ------------------//
  
  async deleteRating(ratingPk: string, userPk: string): Promise<void> {
    const result = await this.ratingRepository
      .createQueryBuilder()
      .delete()
      .from(Rating)
      .where('rating_pk = :ratingPk AND user_fk = :userPk', {
        ratingPk,
        userPk,
      })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('Ratingen blev ikke fundet');
    }
  }
}
