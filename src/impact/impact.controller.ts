import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../shared/decorators';
import { PaginationQueryDto } from '../shared/pagination-query.dto';
import { Role } from '../shared/roles.enum';
import { CreateImpactLogDto } from './dto/create-impact-log.dto';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { UpdateImpactLogDto } from './dto/update-impact-log.dto';
import { ImpactService } from './impact.service';

// Reports: any logged-in user (JwtAuthGuard is global, so no @Roles needed)
@ApiTags('Impact')
@ApiBearerAuth()
@Controller('impact')
export class ImpactController {
  constructor(private readonly impact: ImpactService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Meals saved, kg rescued and CO2 avoided' })
  summary() {
    return this.impact.summary();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Top donors by meals saved' })
  leaderboard(@Query() q: LeaderboardQueryDto) {
    return this.impact.leaderboard(q.limit);
  }
}

// Manual CRUD on impact_logs: Admin only
@ApiTags('Impact logs (Admin)')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('impact-logs')
export class ImpactLogsController {
  constructor(private readonly impact: ImpactService) {}

  @Post()
  @ApiOperation({ summary: 'Create an impact log manually' })
  create(@Body() dto: CreateImpactLogDto) {
    return this.impact.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Paginated impact logs' })
  findAll(@Query() q: PaginationQueryDto) {
    return this.impact.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.impact.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Correct an impact log' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImpactLogDto) {
    return this.impact.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.impact.remove(id);
  }
}
