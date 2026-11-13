import {IsNotEmpty, IsString, IsDateString, Max, Min} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({ message: 'Film skal have et id' })
  @Min(32)
  @Max(32)
  id: string

  @IsString()
  @Max(255, { message: 'Titel må max være 255 karakterer' })
  @IsNotEmpty({ message: 'Film skal have en titel' })
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Film skal have en genre' })
  genre: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Film skal have et udgivelsesår' })
  release_year: number;

  @IsString()
  poster_url: string;
}
