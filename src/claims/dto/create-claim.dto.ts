import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty({ example: 5, description: 'Id of the food listing to claim' })
  @IsInt({ message: 'listingId must be an integer' })
  @Min(1)
  listingId: number;

  @ApiProperty({ example: 20, description: 'How many units to claim (same unit as the listing)' })
  @IsInt({ message: 'quantity must be a whole number' })
  @Min(1, { message: 'quantity must be at least 1' })
  @Max(100000)
  quantity: number;

  @ApiPropertyOptional({
    example: false,
    description: 'DEMO ONLY. Forces a failure after all inserts to show the rollback. Needs ALLOW_DEMO_FAILURE=true.',
  })
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
