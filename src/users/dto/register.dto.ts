
import {
    IsEmail,
    IsEnum,
    IsIn,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

import { UserRole } from '../../common/enums/role.enum';

export class RegisterDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsIn([UserRole.DONOR, UserRole.RECEIVER, UserRole.VOLUNTEER])
    role?: UserRole;
}
