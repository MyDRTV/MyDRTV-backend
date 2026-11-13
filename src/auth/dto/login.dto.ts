import {IsNotEmpty, IsString, IsEmail} from "class-validator";

export class LogIn{
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}