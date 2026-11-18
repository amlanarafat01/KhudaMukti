import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateImpactLogDto {
  @ApiProperty({ example: 1, description: 'Claim this log belongs to (one log per claim)' })
  @IsInt()
  @Min(1)
  claimId: number;

  @ApiProperty({ example: 40 })
  @IsInt({ message: 'mealsSaved must be a whole number' })
  @Min(0)
  mealsSaved: number;

  @ApiProperty({ example: 16.5 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'kgRescued must be a number with at most 2 decimals' })
  @Min(0)
  kgRescued: number;

  @ApiProperty({ example: 41.25 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'co2Saved must be a number with at most 2 decimals' })
  @Min(0)
  co2Saved: number;
}
