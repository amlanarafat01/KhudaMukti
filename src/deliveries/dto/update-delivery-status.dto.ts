import { IsEnum } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery-status.enum';

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
}