
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodListing } from './entities/food-listing.entity.js';
import { FoodCategory } from '../food-category/entities/food-category.entity.js';
import { LocalUser } from './entities/local-user.entity.js';
import { FoodListingsService } from './food-listing.service.js';
import { FoodListingsController } from './food-listing.controller.js';
import { FoodListingsExpiryService } from './food-listing-expiry.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodListing,FoodCategory,LocalUser])],
  controllers: [FoodListingsController],
  providers: [FoodListingsService,FoodListingsExpiryService],
  exports: [FoodListingsService]
})
export class FoodListingsModule {}
