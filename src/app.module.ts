import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesModule } from './deliveries/deliveries.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { Delivery } from './deliveries/entities/delivery.entity.js';
import { Review } from './reviews/entities/review.entity.js';
import { FoodListing } from './food-listing/entities/food-listing.entity.js';
import { FoodCategory } from './food-category/entities/food-category.entity.js';
import { LocalUser } from './food-listing/entities/local-user.entity.js';
import { AuditLog } from './audit-logs/entities/audit-log.entity.js';
import { AuditLogsModule } from './audit-logs/audit-logs.module.js';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { CreateAuditLogs1710840000000 } from './database/migrations/1710840000000-CreateAuditLogs.js';
import { CreateDeliveryReviewTables1710840001000 } from './database/migrations/1710840001000-CreateDeliveryReviewTables.js';
import { AuthModule } from './auth/auth.module.js';
import { ClaimsModule } from './claims/claims.module.js';
import { FoodListingsModule } from './food-listing/food-listing.module.js';
import { FoodCategoriesModule } from './food-category/food-category.module.js';
import { Claim } from './claims/entities/claim.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'khudamukti'),
        entities: [
          Delivery,
          Review,
          FoodListing,
          FoodCategory,
          LocalUser,
          AuditLog,
        ],
        autoLoadEntities: true,
        migrations: [
          CreateAuditLogs1710840000000,
          CreateDeliveryReviewTables1710840001000,
        ],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    AuthModule,
    ClaimsModule,
    FoodListingsModule,
    FoodCategoriesModule,
    DeliveriesModule,
    ReviewsModule,
    AuditLogsModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
