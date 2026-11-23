import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), RatingsModule],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
