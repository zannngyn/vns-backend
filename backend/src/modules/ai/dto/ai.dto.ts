import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiSearchDto {
  @ApiProperty({ description: 'Natural language search query', example: 'ao di lam van phong nam' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Max number of results', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  limit?: number;
}

export class AiChatDto {
  @ApiProperty({ description: 'User message', example: 'Goi y cho minh outfit di cafe cuoi tuan' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Existing session ID to continue conversation' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
