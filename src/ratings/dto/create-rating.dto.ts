import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @Length(32, 32)
  userId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
