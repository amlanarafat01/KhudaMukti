import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'Test Receiver' }) @IsString() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'receiver@example.com' }) @IsEmail() @MaxLength(255) email!: string;
  @ApiProperty({ minLength: 8, example: 'TestPass123!' }) @IsString() @MinLength(8) @MaxLength(100) password!: string;
  @ApiPropertyOptional({ enum: ['DONOR', 'RECEIVER', 'VOLUNTEER'], default: 'RECEIVER' }) @IsOptional() @IsIn(['DONOR', 'RECEIVER', 'VOLUNTEER']) role?: string;
}
