
import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    Request,
    UseGuards,
    ForbiddenException,
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';

import { Request as ExpressRequest } from 'express';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
        role: UserRole;
    };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Roles(UserRole.ADMIN)
    @Get()
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.usersService.findAll(
            Math.max(1, page),
            Math.min(100, Math.max(1, limit)),
        );
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @Request() req: AuthenticatedRequest,
    ) {
        if (
            req.user.role !== UserRole.ADMIN &&
            req.user.id !== id
        ) {
            throw new ForbiddenException('You cannot view this user');
        }

        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req: AuthenticatedRequest,
    ) {
        if (
            req.user.role !== UserRole.ADMIN &&
            req.user.id !== id
        ) {
            throw new ForbiddenException('You cannot update this user');
        }

        return this.usersService.update(id, updateUserDto);
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/verify')
    verify(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('isVerified') isVerified: boolean,
    ) {
        return this.usersService.verifyUser(id, isVerified);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.usersService.remove(id);
    }
}
