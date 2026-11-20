import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Movie } from '../../movies/entity/movie.entity';

@Entity('watchlist')
export class Watchlist {
  @PrimaryColumn({ type: 'char', length: 32 })
  user_fk!: string;

  @PrimaryColumn({ type: 'char', length: 32 })
  movie_fk!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_fk' })
  user!: User;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_fk' })
  movie!: Movie;

  @Column({ type: 'bigint' })
  watchlist_added_at!: string;
}
