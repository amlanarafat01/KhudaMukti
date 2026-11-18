// Member 3 version of the root module. When merging, keep Member 1's AppModule and just import
// ClaimsModule, ImpactModule and MailModule into it (remove the SHARED parts you already have).
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClaimsModule } from './claims/claims.module';
import { envValidationSchema } from './config/env.validation';
import { ImpactModule } from './impact/impact.module';
import { MailModule } from './mail/mail.module';
import { AllExceptionsFilter } from './shared/http-exception.filter';
import { JwtAuthGuard, RolesGuard } from './shared/guards';
import { JwtStrategy } from './shared/jwt.strategy';
import { ResponseInterceptor } from './shared/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.get<string>('DB_HOST'),
        port: c.get<number>('DB_PORT'),
        username: c.get<string>('DB_USER'),
        password: c.get<string>('DB_PASSWORD'),
        database: c.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, // schema comes from migrations only
      }),
    }),
    PassportModule,
    MailModule,
    ClaimsModule,
    ImpactModule,
  ],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // every route needs a token unless @Public()
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
