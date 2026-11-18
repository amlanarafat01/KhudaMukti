import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../shared/pagination-query.dto';
import { ClaimStatus } from '../claim.entity';

export class QueryClaimDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ClaimStatus })
  @IsOptional()
  @IsEnum(ClaimStatus, { message: 'status must be CONFIRMED, CANCELLED or COMPLETED' })
  status?: ClaimStatus;
}
