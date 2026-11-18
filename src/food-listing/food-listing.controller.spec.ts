import { Test, TestingModule } from '@nestjs/testing';
import { FoodListingController } from './food-listing.controller.js';

describe('FoodListingController', () => {
  let controller: FoodListingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodListingController],
    }).compile();

    controller = module.get<FoodListingController>(FoodListingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
