import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';

export class UpdateMovieDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Titel må max være 255 karakterer' })
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsInt()
  @IsOptional()
  release_year?: number;

  @IsString()
  @IsOptional()
  poster_url?: string;
}
