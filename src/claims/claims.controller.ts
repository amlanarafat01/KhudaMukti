import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../shared/decorators';
import { AuthUser, Role } from '../shared/roles.enum';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { QueryClaimDto } from './dto/query-claim.dto';
import { CancelClaimDto } from './dto/update-claim.dto';

@ApiTags('Claims')
@ApiBearerAuth()
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claims: ClaimsService) {}

  @Post()
  @Roles(Role.RECEIVER)
  @ApiOperation({ summary: 'Claim food (transaction: lock, claim, stock, delivery, impact)' })
  create(@Body() dto: CreateClaimDto, @CurrentUser() user: AuthUser) {
    return this.claims.create(dto, user); // 201 by default for POST
  }

  @Get()
  @Roles(Role.RECEIVER, Role.DONOR, Role.ADMIN)
  @ApiOperation({ summary: 'Paginated claims: receiver sees own, donor sees claims on own listings, admin sees all' })
  findAll(@Query() query: QueryClaimDto, @CurrentUser() user: AuthUser) {
    return this.claims.findAll(query, user);
  }

  @Get(':id')
  @Roles(Role.RECEIVER, Role.DONOR, Role.ADMIN)
  @ApiOperation({ summary: 'One claim (owner receiver, listing donor or admin)' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.claims.findOne(id, user);
  }

  @Patch(':id/cancel')
  @Roles(Role.RECEIVER)
  @ApiOperation({ summary: 'Cancel own claim and restore stock' })
  cancel(@Param('id', ParseIntPipe) id: number, @Body() dto: CancelClaimDto, @CurrentUser() user: AuthUser) {
    return this.claims.cancel(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin: delete a claim' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.claims.remove(id);
  }
}
