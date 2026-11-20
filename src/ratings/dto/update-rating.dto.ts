import { IsInt, Min, Max, Length, IsString } from 'class-validator';

export class UpdateRatingDto {
  @IsString()
  @Length(32, 32)
  userId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}
