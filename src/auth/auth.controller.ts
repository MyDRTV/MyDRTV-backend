import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LogInDto } from './dto/login.dto';
@Controller('/auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    //------------------ POST user signup ------------------//
    @Post('/signup')
    signup(@Body() signUpDto: SignUpDto) {
        return this.authService.signup(signUpDto);
    }

    //------------------ POST user login ------------------//
    // login er post request, da vi sender data (email og password) til serveren for at logge ind.
    @Post('/login')
    login(@Body() logInDto: LogInDto) {
        return this.authService.login(logInDto);
    }
}