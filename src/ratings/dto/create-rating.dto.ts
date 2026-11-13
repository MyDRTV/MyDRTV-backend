import {IsInt, IsString, Min, Max, IsNotEmpty} from 'class-validator';

export class CreateRating {
    @IsString()
    @IsNotEmpty({ message: 'Ratings skal have et id' })
    @Min(32)
    @Max(32)
    id: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: string;
}
