import { IsOptional, IsString, IsEnum, IsInt, Min, Max} from 'class-validator';
import { Type} from 'class-transformer';
import { ListingStatus} from '../entities/listing-status.enum.js';

export class QueryFoodListingDto {


  @IsOptional()
  @IsString()

  area?: string;

  @IsOptional()
  @IsString()

  category?: string;

  @IsOptional()
  @IsEnum(ListingStatus)

  status?: ListingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

}