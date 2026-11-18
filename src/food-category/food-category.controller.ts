import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,} from '@nestjs/common';
import { FoodCategoriesService,} from './food-category.service.js';
import { CreateFoodCategoryDto} from './dto/create-food-category.dto.js';
import { UpdateFoodCategoryDto} from './dto/update-food-category.dto.js';
import { QueryFoodCategoryDto} from './dto/query-food-category.dto.js';
// import { JwtGuard} from '../auth/jwtGuard.guard.js';

// import {
//   RolesGuard,
// } from '../auth/roles/roles/roles.guard.js';

// import {
//   Roles,
// } from '../auth/roles/roles/roles.decorator.js';

@Controller('categories')
// @UseGuards(JwtGuard, RolesGuard)
export class FoodCategoriesController {
  constructor(private readonly foodCategoriesService: FoodCategoriesService){}

  @Post()
  // @Roles('admin')
  async create(@Body() dto: CreateFoodCategoryDto){
    return this.foodCategoriesService.create(dto);
  }

  @Get()
  async findAll(@Query() query: QueryFoodCategoryDto) {
    return this.foodCategoriesService.findAll(query);
  }


  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.foodCategoriesService.findOne(id);
  }

  @Patch(':id')
  // @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number,@Body() dto: UpdateFoodCategoryDto) {
    return this.foodCategoriesService.update(id, dto);
  }

  @Delete(':id')
  // @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.foodCategoriesService.remove(id);
  }
}