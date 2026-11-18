import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelClaimDto {
  @ApiPropertyOptional({ example: 'We no longer need this quantity' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
