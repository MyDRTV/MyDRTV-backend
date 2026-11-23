
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UpdateUser } from './dto/update-user.dto';
import { PasswordService } from '../common/password/password.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly passwordService: PasswordService,
    ) {}
    
    //------------------ Find alle brugere ------------------//
    findAll(): Promise<User[]> {
        return this.userRepository.find({
            order: {
                user_name: 'ASC',
            },
        });
    }

    //------------------ Find bruger by id ------------------//
    async findByUserPk(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { user_pk: userId },
        });

        if (!user) {
            throw new NotFoundException('Bruger blev ikke fundet');
        }

        return user;
    }

    //------------------ Find brugerrolle ------------------//
    async findRoleByUserPk(userPk: string,): Promise<User['user_role'] | undefined> {

        const user = await this.userRepository.findOne({
            where: { user_pk: userPk },
            select: { user_role: true },
        });

        return user?.user_role;
    }


    //------------------ Opdater brugeroplysninger ------------------//
    async updateUser(userId: string, updateUserDto: UpdateUser) {

        // Kontrollér at brugeren eksisterer
        await this.findByUserPk(userId);

        // Partial update data object, kun de felter der skal opdateres
        const updateData: Partial<User> = {};

        // Hvis navnet er defineret, opdater det
        if (updateUserDto.name !== undefined) {
            updateData.user_name = updateUserDto.name;
        }

        // hvis email er defineret, opdater det
        if (updateUserDto.email !== undefined) {
            updateData.user_email = updateUserDto.email;
        }

        // opdater det nye data
        await this.userRepository.update({ user_pk: userId }, updateData);

        return {
            message: 'Bruger opdateret succesfuldt',
        };
    }

    //------------------ Opdater password separat ------------------//
    // Denne metode er nødvendig, da password ikke kan opdateres via updateUserDto, da det kræver hashing
    // som er en følsom operation, der ikke bør håndteres direkte i controlleren
    async updatePassword(userId: string, newPassword: string) {

        await this.findByUserPk(userId);

        const hashedPassword = await this.passwordService.hashPassword(newPassword);

        await this.userRepository.update(
            { user_pk: userId },
            { user_password: hashedPassword }
        );

        return { message: 'Password opdateret succesfuldt'};
    }

    //------------------ Slet bruger ------------------//
    async deleteUser(userId: string) {
        await this.findByUserPk(userId);
        await this.userRepository.delete({ user_pk: userId });
        return { message: 'Bruger slettet succesfuldt' };
    }
}
