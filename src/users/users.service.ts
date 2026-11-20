import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findRoleByUserPk(
    userPk: string,
  ): Promise<User['user_role'] | undefined> {
    const user = await this.userRepository.findOne({
      where: { user_pk: userPk },
      select: { user_role: true },
    });

    return user?.user_role;
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: {
        user_name: 'ASC',
      },
    });
  }
}
