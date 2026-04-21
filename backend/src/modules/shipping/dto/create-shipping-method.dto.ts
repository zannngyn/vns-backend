import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShippingMethodDto {
  @ApiProperty({ example: 'Giao hàng tiêu chuẩn', description: 'Shipping method name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 30000, description: 'Shipping fee (VND)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fee: number;

  @ApiProperty({ example: 3, description: 'Estimated delivery days' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  estimatedDays: number;

  @ApiPropertyOptional({ example: true, description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
