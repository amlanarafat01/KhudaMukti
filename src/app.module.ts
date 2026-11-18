
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { FoodCategoriesModule } from './food-category/food-category.module.js';
import { FoodListingsModule } from './food-listing/food-listing.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'shakil1234',
      database: 'khudamukti_db',
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),
    FoodCategoriesModule,
    FoodListingsModule,
    ScheduleModule.forRoot(),
  
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
