import {Injectable, NotFoundException, ConflictException,} from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { FoodCategory} from './entities/food-category.entity.js';
import { CreateFoodCategoryDto} from './dto/create-food-category.dto.js';
import { UpdateFoodCategoryDto} from './dto/update-food-category.dto.js';
import { QueryFoodCategoryDto} from './dto/query-food-category.dto.js';



function getPgErrorCode(error: unknown): string|undefined {
  if (typeof error !== 'object' || error===null) {
    return undefined;
  }

  const err = error as {
    code?: string;
    driverError?: {
      code?: string;
    };
  };

  return err.driverError?.code ?? err.code;
}

@Injectable()
export class FoodCategoriesService {
  constructor(
    @InjectRepository(FoodCategory)

    private readonly categoryRepository: Repository<FoodCategory>) {}

  async create(dto: CreateFoodCategoryDto): Promise<FoodCategory> {
        const name = dto.name.trim().toLowerCase();
        const existing = await this.categoryRepository.findOneBy({name});


    if (existing) {
      throw new ConflictException('Food category already exists');
    }
    try {
      const category = this.categoryRepository.create({name});
      return await this.categoryRepository.save(category);
    } catch (error: unknown){
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException('Food category already exists');
      
    }
      throw error;
    }
  }


  async findAll(query: QueryFoodCategoryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const [data, total] =
      await this.categoryRepository.findAndCount({
        order: {
          name: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
        data,
        meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }



  async findOne(id: number): Promise<FoodCategory> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Food category not found');
    }
    return category;
  }

  async update(id: number, dto: UpdateFoodCategoryDto): Promise<FoodCategory>{
    
    const category = await this.findOne(id);
    if (dto.name !== undefined) {
      const name = dto.name.trim().toLowerCase();

      const duplicate = await this.categoryRepository.findOneBy({ name });
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException( 'Food category already exists');
      }
      category.name = name;
    }

    try {
      return await this.categoryRepository.save(category);
    } catch (error: unknown) {
      if (getPgErrorCode(error)=== '23505') {
        throw new ConflictException('Food category already exists');
      }
      throw error;
    }
  }


  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return {
      message: 'Food category deleted successfully',
    };
  }
}