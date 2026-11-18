import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
export class CreateClaimDto {
  @ApiProperty({ example: 1 }) @Type(() => Number) @IsInt() @Min(1) listingId!: number;
  @ApiProperty({ example: 1 }) @Type(() => Number) @IsInt() @Min(1) quantity!: number;
}
