import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @IsNotEmpty() @IsString() code: string;
  @IsNotEmpty() @IsEnum(DiscountType) discountType: DiscountType;
  @IsNotEmpty() @Type(() => Number) @IsNumber() discountValue: number;
  @IsOptional() @Type(() => Number) @IsNumber() minOrderValue?: number;
  @IsOptional() @Type(() => Number) @IsNumber() maxDiscountValue?: number;
  @IsOptional() @Type(() => Number) @IsNumber() usageLimit?: number;
  @IsNotEmpty() @IsDateString() startDate: string;
  @IsNotEmpty() @IsDateString() endDate: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
