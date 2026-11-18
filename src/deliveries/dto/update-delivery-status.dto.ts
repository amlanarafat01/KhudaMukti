import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery-status.enum.js';

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: [DeliveryStatus.PICKED_UP, DeliveryStatus.DELIVERED] })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
}
