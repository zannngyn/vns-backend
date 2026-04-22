import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsEnum, Allow } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreateSkuDto {
  @IsOptional() @IsString() skuCode?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() colorHex?: string;
  @IsOptional() @IsString() size?: string;
  @IsOptional() @Allow() price?: any;
  @IsOptional() @Allow() salePrice?: any;
  @IsOptional() @Allow() stock?: any;
}

export class CreateProductDto {
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsNotEmpty() categoryId: any;
  @IsNotEmpty() brandId: any;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSkuDto)
  skus: CreateSkuDto[];
}
