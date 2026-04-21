import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Gender } from '@prisma/client';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  categoryId?: bigint;

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  brandId?: bigint;

  @ApiPropertyOptional({ description: 'Gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Color ID' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  colorId?: bigint;

  @ApiPropertyOptional({ description: 'Size ID' })
  @IsOptional()
  @Transform(({ value }) => BigInt(value))
  sizeId?: bigint;

  @ApiPropertyOptional({ description: 'Sort by: relevance, price_asc, price_desc, newest' })
  @IsOptional()
  @IsString()
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}
