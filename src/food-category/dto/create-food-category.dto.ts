import { IsString, IsNotEmpty, MinLength, MaxLength,} from 'class-validator';

export class CreateFoodCategoryDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(80)
    name!: string;
}