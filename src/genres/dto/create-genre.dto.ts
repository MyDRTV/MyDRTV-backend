import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGenre {
  @IsString()
  @IsNotEmpty({ message: 'Genre skal være udfyldt' })
  @MaxLength(100, { message: 'Genre må ikke overstige 100 karakterer' })
  name!: string;
}