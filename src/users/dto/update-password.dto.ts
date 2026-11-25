import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Length(8, 255, { message: 'Adgangskoden skal være mellem 8 og 255 tegn' })
  newPassword!: string;
}
