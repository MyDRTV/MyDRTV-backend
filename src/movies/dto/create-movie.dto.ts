import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class CreateMovieDto {
  // @ er decorater
  @IsString()
  @IsNotEmpty({ message: 'Animal must have a name' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Animal must have a description' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Animal must have a type' })
  type: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsBoolean()
  star: boolean;

  @IsBoolean()
  winner: boolean;
}
