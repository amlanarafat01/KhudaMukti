import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

// claimId can not be changed once a log exists
export class UpdateImpactLogDto {
  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt({ message: 'mealsSaved must be a whole number' })
  @Min(0)
  mealsSaved?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  kgRescued?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  co2Saved?: number;
}
