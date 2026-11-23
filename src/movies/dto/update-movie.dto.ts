import {IsNotEmpty, IsString, IsDateString, Max, IsOptional} from 'class-validator';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  @Max(255, { message: 'Titel må max være 255 karakterer' })
  title?: string;

  @IsString()
@IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsDateString()
  @IsOptional()
  release_year?: number;

  @IsString()
  @IsOptional()
  poster_url?: string;
}
