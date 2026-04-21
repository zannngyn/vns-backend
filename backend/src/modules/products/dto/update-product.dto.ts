import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, ValidateNested, IsArray, IsString, IsBoolean, Allow } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSkuDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() skuCode?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() colorHex?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @Allow() price?: any;
  @IsOptional() @Allow() salePrice?: any;
  @IsOptional() @Allow() stock?: any;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSkuDto)
  skus?: UpdateSkuDto[];
}
