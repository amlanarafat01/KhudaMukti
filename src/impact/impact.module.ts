import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../claims/claim.entity';
import { ImpactLogsController, ImpactController } from './impact.controller';
import { ImpactLog } from './impact-log.entity';
import { ImpactService } from './impact.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImpactLog, Claim])],
  controllers: [ImpactController, ImpactLogsController],
  providers: [ImpactService],
  exports: [ImpactService],
})
export class ImpactModule {}
