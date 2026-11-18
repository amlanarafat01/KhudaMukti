import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { DevRegisterDto } from './dto/dev-register.dto.js';
@ApiTags('auth') @Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto:RegisterDto){return this.auth.register(dto);}
  @Post('login') login(@Body() dto:LoginDto){return this.auth.login(dto);}
  @Post('dev/register') @ApiOperation({summary:'Local testing only; creates a verified test account for requested role'})
  registerDev(@Body() dto:DevRegisterDto){return this.auth.registerDev(dto);}
}
