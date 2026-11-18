import { ValidateIf, IsString, IsNotEmpty, IsInt, Min, MaxLength, IsDateString, IsArray, ArrayUnique} from 'class-validator';
import { Type} from 'class-transformer';

export class UpdateFoodListingDto {

  @ValidateIf((object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ValidateIf((object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalQty?: number;

  @ValidateIf((object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  unit?: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsDateString()
  expiresAt?: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  pickupAddress?: string;

  @ValidateIf((object, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds?: number[];


  
}