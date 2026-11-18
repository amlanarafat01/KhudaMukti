import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsController } from './claims.controller.js';
import { ClaimsService } from './claims.service.js';
import { Claim } from './entities/claim.entity.js';
import { FoodListing } from '../food-listing/entities/food-listing.entity.js';
import { LocalUser } from '../food-listing/entities/local-user.entity.js';
@Module({imports:[TypeOrmModule.forFeature([Claim,FoodListing,LocalUser])],controllers:[ClaimsController],providers:[ClaimsService],exports:[ClaimsService]})
export class ClaimsModule{}
