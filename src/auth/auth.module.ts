import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalUser } from '../food-listing/entities/local-user.entity.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
@Module({imports:[TypeOrmModule.forFeature([LocalUser]),JwtModule.registerAsync({global:true,imports:[ConfigModule],inject:[ConfigService],useFactory:(config:ConfigService)=>({secret:config.getOrThrow<string>('JWT_SECRET'),signOptions:{expiresIn:'2h'}})})],controllers:[AuthController],providers:[AuthService,JwtAuthGuard,RolesGuard],exports:[JwtModule,JwtAuthGuard,RolesGuard]})
export class AuthModule{}
