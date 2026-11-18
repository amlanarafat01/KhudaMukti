import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';

import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';


import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('deliveries')
@ApiBearerAuth()
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get('open')
  @Roles('VOLUNTEER')
  findOpenDeliveries() {
    return this.deliveriesService.findOpenDeliveries();
  }

  @Patch(':id/accept')
  @Roles('VOLUNTEER')
  acceptDelivery(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.deliveriesService.acceptDelivery(id, user.id);
  }

  @Patch(':id/status')
  @Roles('VOLUNTEER')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryStatusDto: UpdateDeliveryStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveriesService.updateStatus(
      id,
      updateDeliveryStatusDto,
      user.id,
    );
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliveriesService.remove(id);
  }
}