import { IsInt, Min } from 'class-validator';

export class CreateDeliveryDto {
  @IsInt()
  @Min(1)
  claimId: number;
}