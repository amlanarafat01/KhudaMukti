import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'ID of an existing claim that needs a volunteer delivery',
  })
  @IsInt()
  @Min(1)
  claimId: number;
}
