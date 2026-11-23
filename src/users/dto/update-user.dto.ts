import {IsNotEmpty, IsString, MaxLength, MinLength, IsEmail, IsOptional} from 'class-validator';

export class UpdateUser {

    @IsOptional()
    @IsString()
    @MaxLength(50, {message: 'Navn må max være 50 karakterer'})
    @IsNotEmpty({message: 'Navn skal være udfyldt'})
    name?: string;

    @IsOptional()
    @IsEmail({}, {message: 'Skal være en gyldig e-mail-adresse'})
    @MaxLength(255)
    @IsNotEmpty({ message: 'E-mail skal være udfyldt'})
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8, {message: 'Adgangskode skal mindst have 8 karakterer'})
    @MaxLength(255)
    @IsNotEmpty({message: 'Adgangskode skal være udfyldt'})
    password?: string;
}