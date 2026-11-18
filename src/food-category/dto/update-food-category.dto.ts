import { ValidateIf, IsString, IsNotEmpty, MinLength, MaxLength} from 'class-validator';


export class UpdateFoodCategoryDto {
 
    @ValidateIf((object, value) => value !== undefined)
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(80)
    name?: string;
}