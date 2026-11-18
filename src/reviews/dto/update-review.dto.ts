import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
