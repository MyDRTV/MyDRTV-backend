import { IsString, Length } from 'class-validator';

export class CreateWatchlist {
  @IsString()
  @Length(32, 32)
  moviePk!: string;
}
