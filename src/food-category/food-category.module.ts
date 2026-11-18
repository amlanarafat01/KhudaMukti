import { Module} from '@nestjs/common';
import { TypeOrmModule} from '@nestjs/typeorm';
import { FoodCategory} from './entities/food-category.entity.js';
import { FoodCategoriesService} from './food-category.service.js';
import { FoodCategoriesController} from './food-category.controller.js';
import { FoodCategoriesSeeder} from './food-categories.seeder.js';
// import { AuthModule} from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([FoodCategory,]),
    // AuthModule,
  ],
  controllers: [FoodCategoriesController],
  providers: [FoodCategoriesService, FoodCategoriesSeeder],
  exports: [ FoodCategoriesService],

})

export class FoodCategoriesModule {}