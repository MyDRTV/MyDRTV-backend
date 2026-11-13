import {IsNotEmpty, IsString, Max, Min, IsEmail} from 'class-validator';

export class UpdateUser {
  @IsString()
  @Max(50, { message: 'Navn må max være 50 karakterer' })
  @IsNotEmpty({ message: 'Navn skal være udfyldt' })
  name: string;

  @IsString({ message: 'Skal være gyldig e-mail-adresse' })
  @IsEmail()
  @IsNotEmpty({ message: 'E-mail skal være udfyldt' })
  @Max(255)
  email: string;

  @IsString()
  @Min(8,  {message: 'Adgangskode skal mindst have 8 karakterer' })
  @Max(255)
  @IsNotEmpty({ message: 'Adgangskode skal have en genre' })
  password: string;
}
