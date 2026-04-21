import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShippingMethodDto {
  @ApiPropertyOptional({ example: 'Giao hàng nhanh', description: 'Shipping method name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Shipping fee (VND)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  fee?: number;

  @ApiPropertyOptional({ example: 1, description: 'Estimated delivery days' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  estimatedDays?: number;

  @ApiPropertyOptional({ example: false, description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
