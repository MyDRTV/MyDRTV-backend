import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Rating } from '../ratings/entity/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Rating])],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
