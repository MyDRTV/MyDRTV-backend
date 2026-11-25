import { IsNotEmpty, IsString, MaxLength, IsInt } from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @MaxLength(255, { message: 'Titel må max være 255 karakterer' })
  @IsNotEmpty({ message: 'Film skal have en titel' })
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Film skal have en genre' })
  genre: string;

  @IsInt()
  @IsNotEmpty({ message: 'Film skal have et udgivelsesår' })
  release_year: number;

  @IsString()
  poster_url: string;
}
