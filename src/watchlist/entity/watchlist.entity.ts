import { Column, Entity, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Movie } from '../../movies/entity/movie.entity';
@Entity('watchlist')
export class Watchlist {

    @ManyToOne(()=> User)
    @JoinColumn({name: 'user_fk'})
    user!: User;

    @ManyToOne(()=> Movie)
    @JoinColumn({name: 'movie_fk'})
    movie_fk: string;

    @Column({ type: 'bigint' })
    watchlist_added_at!: number;
}
