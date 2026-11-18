import { Module } from '@nestjs/common';
import { OrganizationProfilesController } from './organization-profiles.controller';
import { OrganizationProfilesService } from './organization-profiles.service';

@Module({
  controllers: [OrganizationProfilesController],
  providers: [OrganizationProfilesService]
})
export class OrganizationProfilesModule {}
