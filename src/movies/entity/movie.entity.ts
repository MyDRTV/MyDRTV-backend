import { Column, Entity, PrimaryColumn } from 'typeorm';

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
}
