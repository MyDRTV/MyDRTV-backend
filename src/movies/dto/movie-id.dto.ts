import { Matches } from 'class-validator';

export class MovieIdDto {
  @Matches(/^[0-9a-f]{32}$/i, {
    message: 'Filmens id skal bestå af 32 hexa-decimale tegn',
  })
  id!: string;
}
