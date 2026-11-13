import { Column, Entity, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Movie } from '../../movies/entity/movie.entity';

@Entity('ratings')
export class Rating {
    @PrimaryColumn({ type: 'char', length: 32 })
    rating_pk!: string;

    @ManyToOne(()=> User)
    @JoinColumn({name: 'user_fk'})
    user!: User;

    @ManyToOne(()=> Movie)
    @JoinColumn({name: 'movie_fk'})
    movie_fk: string;

    @Column({ type: 'tinyint' })
    rating!: number;
}
