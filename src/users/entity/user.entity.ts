import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('users')
export class User {

    @PrimaryColumn({ type: 'char', length: 32 })
    user_pk!: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    user_name!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    user_email!: string;

    // Password returneres ikke automatisk fra queries
    @Column({ type: 'varchar', length: 255, select: false })
    user_password!: string;

    @Column({ type: 'varchar', length: 10, default: 'user' })
    user_role!: 'user' | 'admin';

    @Column({ type: 'bigint' })
    user_created_at!: number;
}