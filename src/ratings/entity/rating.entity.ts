import {Column, Entity, PrimaryColumn, JoinColumn, ManyToOne, Index,} from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Movie } from '../../movies/entity/movie.entity';

@Entity('ratings')
@Index(['user', 'movie'], { unique: true })
export class Rating {
  @PrimaryColumn({ type: 'char', length: 32 })
  rating_pk!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_fk' })
  user!: User;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_fk' })
  movie!: Movie;

  @Column({ type: 'smallint' })
  rating!: number;
}