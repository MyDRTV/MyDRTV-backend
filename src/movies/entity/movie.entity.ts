import { Column, Entity, ManyToMany, PrimaryColumn, JoinTable } from 'typeorm';
import { Genre } from '../../genres/entity/genre.entity';

@Entity('movies')
export class Movie {
  @PrimaryColumn({ type: 'char', length: 32 })
  movie_pk!: string;

  @Column({ type: 'varchar', length: 255 })
  movie_title!: string;

  @Column({ type: 'bigint' })
  movie_release_year!: string;

  @Column({ type: 'text', nullable: true })
  movie_description!: string | null;

  @Column({ type: 'text', nullable: true })
  movie_poster_url!: string | null;

  @ManyToMany(() => Genre)
  @JoinTable({
  name: 'junction_movie_genres',
  joinColumn: {name: 'movie_fk', referencedColumnName: 'movie_pk'},
  inverseJoinColumn: {name: 'genre_fk', referencedColumnName: 'genre_pk'},
  })
  genres!: Genre[];
}
