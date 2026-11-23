import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
import { Roles } from '../auth/decorators/role.decorator';

@Controller('/auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    //------------------ POST user signup ------------------//
    @Post('/signup')
    @Roles('user', 'admin')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() signUpDto: SignUpDto) {
        return this.authService.signup(signUpDto);
    }

    //------------------ POST user login ------------------//
    // login er post request, da vi sender data (email og password) til serveren for at logge ind.
    @Post('/login')
    @Roles('user', 'admin')
    @HttpCode(HttpStatus.OK)
    login(@Body() logInDto: LogInDto) {
        return this.authService.login(logInDto);
    }
}