import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClaimsService } from './claims.service.js';
import { CreateClaimDto } from './dto/create-claim.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
@ApiTags('claims') @ApiBearerAuth() @Controller('claims') @UseGuards(JwtAuthGuard,RolesGuard)
export class ClaimsController {
  constructor(private readonly service:ClaimsService){}
  @Post() @Roles('RECEIVER') create(@Body() dto:CreateClaimDto,@CurrentUser() user:any){return this.service.create(dto,String(user.id));}
  @Get() @ApiQuery({name:'page',required:false,type:Number,example:1}) @ApiQuery({name:'limit',required:false,type:Number,example:20})
  findAll(@CurrentUser() user:any,@Query() query:PaginationQueryDto){return this.service.findAll(String(user.id),user.role,query);}
  @Get(':id') findOne(@Param('id',ParseIntPipe) id:number,@CurrentUser() user:any){return this.service.findOne(id,String(user.id),user.role);}
}
