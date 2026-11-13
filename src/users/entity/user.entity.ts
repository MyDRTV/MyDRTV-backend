import { Column, Entity, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryColumn({ type: 'char', length: 32 })
    user_pk!: String;

    @Column({ type: 'varchar', length: 50, unique: true})
    user_name!: String;

    @Column({ type: 'varchar', length: 255, unique: true})
    user_email!: String;

    // select: false = TypeOrm skal ikke returnere denne kolonne i et query, medmindre det eksplicit bliver bedt om
    @Column({type: 'varchar', length: 255, select: false})
    user_password!: String;

    @Column({ type: 'varchar', length: 10, default: 'user'})
    user_role!: 'user' | 'admin';

    @Column({ type: 'bigint'})
    user_created_at!: Number;
}
