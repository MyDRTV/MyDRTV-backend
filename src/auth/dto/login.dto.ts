import {IsNotEmpty, IsString, IsEmail} from "class-validator";

export class LogInDto{
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}