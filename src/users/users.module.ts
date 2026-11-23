import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { PasswordModule } from '../common/password/password.module';

// Global: RolesGuard bruger UsersService i alle moduler
@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PasswordModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}