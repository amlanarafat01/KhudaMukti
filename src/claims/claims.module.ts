import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from '../deliveries/delivery.entity';
import { ImpactLog } from '../impact/impact-log.entity';
import { FoodListing } from '../listings/food-listing.entity';
import { MailModule } from '../mail/mail.module';
import { User } from '../users/user.entity';
import { Claim } from './claim.entity';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, User, FoodListing, Delivery, ImpactLog]), MailModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
