import {IsNotEmpty, IsDateString} from 'class-validator';

export class CreateWatchlist {

  @IsDateString()
  @IsNotEmpty({ message: 'Bruger skal have et tidspunkt for oprettelse' })
  added_at: number;
}
