import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
export class DevRegisterDto {
  @ApiProperty({ example: 'Test Volunteer' }) @IsString() @MaxLength(100) name!: string;
  @ApiProperty({ example: 'volunteer@example.com' }) @IsEmail() @MaxLength(255) email!: string;
  @ApiProperty({ minLength: 8, example: 'TestPass123!' }) @IsString() @MinLength(8) @MaxLength(100) password!: string;
  @ApiProperty({ enum: ['DONOR', 'RECEIVER', 'VOLUNTEER', 'ADMIN'] }) @IsIn(['DONOR', 'RECEIVER', 'VOLUNTEER', 'ADMIN']) role!: string;
}
