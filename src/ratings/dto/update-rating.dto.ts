import {IsInt, Min, Max} from 'class-validator';

export class CreateRating {
    @IsInt()
    @Min(1)
    @Max(5)
    rating: string;
}
