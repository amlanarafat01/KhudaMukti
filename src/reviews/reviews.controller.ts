import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('reviews')
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles('RECEIVER')
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: any) {
    return this.reviewsService.create(createReviewDto, String(user.id));
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @Roles('RECEIVER')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.update(id, updateReviewDto, String(user.id));
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.reviewsService.remove(id, String(user.id), user.role);
  }
}
