import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('genres')
export class Genre {
    @PrimaryColumn({ type: 'char', length: 32 })
    genre_pk!: string;

    @Column({type: 'varchar', length: 100})
    genre_name!: String;
}
