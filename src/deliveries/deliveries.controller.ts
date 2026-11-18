import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { DeliveriesService } from './deliveries.service.js';
import { CreateDeliveryDto } from './dto/create-delivery.dto.js';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto.js';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('deliveries')
@ApiBearerAuth()
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @Get('open')
  @Roles('VOLUNTEER')
  findOpenDeliveries(@Query() query: PaginationQueryDto) {
    return this.deliveriesService.findOpenDeliveries(query);
  }

  @Patch(':id/accept')
  @Roles('VOLUNTEER')
  acceptDelivery(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.deliveriesService.acceptDelivery(id, String(user.id));
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
      String(user.id),
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
