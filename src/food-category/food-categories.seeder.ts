import { Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { FoodCategory} from './entities/food-category.entity.js';

@Injectable()
export class FoodCategoriesSeeder
  implements OnApplicationBootstrap{

  private readonly logger = new Logger(FoodCategoriesSeeder.name);

  constructor(@InjectRepository(FoodCategory)private readonly categoryRepository: Repository<FoodCategory>){}

    async onApplicationBootstrap(): Promise<void> {
 
    const defaultCategories = [
      'cooked',
      'bakery',
      'packaged',
      'fruits',
    ];

    const categories = defaultCategories.map((name) => ({ name }));
    await this.categoryRepository.upsert(categories,['name']);
    this.logger.log(
      'Default categories seeded successfully',
    );
  }
}