import {IsNotEmpty, IsString, IsDateString, IsBoolean, Max, Min, IsEmail} from 'class-validator';

export class CreateUser {
  @IsString()
  @IsNotEmpty({ message: 'Bruger skal have et id' })
  @Min(32)
  @Max(32)
  id: string

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

  @IsBoolean()
  @IsNotEmpty({ message: 'Bruger skal have en rolle' })
  role: boolean;

  @IsDateString()
  @IsNotEmpty({ message: 'Bruger skal have et tidspunkt for oprettelse' })
  created_at: number;
}
