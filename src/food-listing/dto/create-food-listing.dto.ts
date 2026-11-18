import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength, IsDateString, IsArray, ArrayNotEmpty, ArrayUnique} from 'class-validator';
import { Type} from 'class-transformer';

export class CreateFoodListingDto {
  
    @IsString()
  
    @IsNotEmpty()
  @MaxLength(150)
  
    title!: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    totalQty!: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    unit!: string;

    @IsDateString()
    @IsNotEmpty()
    expiresAt!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    pickupAddress!: string;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @Type(() => Number)
    @IsInt({ each: true })
    categoryIds!: number[];

}