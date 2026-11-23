import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
@Controller('/auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    //------------------ POST user signup ------------------//
    @Post('/signup')
    @Roles('user', 'admin')
    signup(@Body() signUpDto: SignUpDto) {
        return this.authService.signup(signUpDto);
    }

    //------------------ POST user login ------------------//
    // login er post request, da vi sender data (email og password) til serveren for at logge ind.
    @Post('/login')
    @Roles('user', 'admin')
    login(@Body() logInDto: LogInDto) {
        return this.authService.login(logInDto);
    }
}