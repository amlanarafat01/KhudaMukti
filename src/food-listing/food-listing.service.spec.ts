import { Test, TestingModule } from '@nestjs/testing';
import { FoodListingService } from './food-listing.service.js';

describe('FoodListingService', () => {
  let service: FoodListingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FoodListingService],
    }).compile();

    service = module.get<FoodListingService>(FoodListingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
