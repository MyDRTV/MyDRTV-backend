import { IsEmail, IsString, Length, IsNotEmpty } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 255, { message: 'Adgangskode skal minimum indeholde 8 karakterer' })
  password!: string;
}
