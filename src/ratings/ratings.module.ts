import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Rating } from './entity/rating.entity';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';
import { AuthModule } from '../auth/auth.module';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User]), AuthModule, MoviesModule],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
