import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entity/rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({
      order: {
        rating: 'ASC',
      },
    });
  }
}
