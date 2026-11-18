import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID of an existing claim with a completed delivery',
  })
  @IsInt()
  @Min(1)
  claimId: number;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
