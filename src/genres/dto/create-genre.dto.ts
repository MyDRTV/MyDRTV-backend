import {IsNotEmpty, IsString, Min, Max} from "class-validator";

export class CreateGenre{
    @IsNotEmpty({ message: 'Ratings skal have et id' })
    @Min(32)
    @Max(32)
    @IsString()
    id: string;


    @IsNotEmpty({ message: 'Genre skal være udfyldt' })
    @IsString()
    @Max(100, { message: 'Genre må ikke overstige 100 karakterer' })
    name: string;
}