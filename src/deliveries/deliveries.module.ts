import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeliveriesController } from './deliveries.controller.js';
import { DeliveriesService } from './deliveries.service.js';
import { Delivery } from './entities/delivery.entity.js';
import { Claim } from '../claims/entities/claim.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Claim])],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}