import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entity/user.entity';
import { PasswordModule } from '../common/password/password.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PasswordModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}