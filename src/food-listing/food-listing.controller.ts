
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query} from '@nestjs/common';
import { FoodListingsService } from './food-listing.service.js';
import { CreateFoodListingDto } from './dto/create-food-listing.dto.js';
import { UpdateFoodListingDto } from './dto/update-food-listing.dto.js';
import { QueryFoodListingDto } from './dto/query-food-listing.dto.js';

const TEST_USER_ID = 'DONOR001';

@Controller('listings')
export class FoodListingsController {
  constructor(private readonly foodListingsService: FoodListingsService){}

  @Post()
  async create(@Body() dto: CreateFoodListingDto) {
    return this.foodListingsService.create(
      dto,
      TEST_USER_ID,
    );
  }

  @Get()
  async findAll(@Query() query: QueryFoodListingDto) {
    return this.foodListingsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number){
    return this.foodListingsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFoodListingDto){
    return this.foodListingsService.update(id,dto,TEST_USER_ID);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number){
    return this.foodListingsService.remove(id,TEST_USER_ID);
  }
}
