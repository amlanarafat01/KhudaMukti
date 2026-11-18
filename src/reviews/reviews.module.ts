import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { Review } from './entities/review.entity.js';
import { Delivery } from '../deliveries/entities/delivery.entity.js';
import { FoodListing } from '../food-listing/entities/food-listing.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Delivery, FoodListing])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
