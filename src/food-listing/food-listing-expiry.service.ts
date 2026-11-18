import {Injectable,Logger,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository,LessThanOrEqual,}from 'typeorm';
import { Cron, CronExpression} from '@nestjs/schedule';
import {FoodListing}from './entities/food-listing.entity.js';
import { ListingStatus} from './entities/listing-status.enum.js';

@Injectable()
export class FoodListingsExpiryService {
  private readonly logger = new Logger(FoodListingsExpiryService.name);

  constructor(@InjectRepository(FoodListing)
  private readonly listingRepository: Repository<FoodListing>) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredListings(): Promise<void> {
    const currentDate = new Date();
    const result = await this.listingRepository.update(
      {
        status: ListingStatus.AVAILABLE,
        expiresAt: LessThanOrEqual(currentDate),
      },

      {
        status: ListingStatus.EXPIRED,
      },
    );
    if (result.affected && result.affected > 0) {
      this.logger.log(
        `${result.affected} listings marked as EXPIRED`,
      );
    }
  }
}