import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID of the Shipping Address', type: String, example: '1' })
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  addressId: bigint;

  @ApiProperty({ description: 'ID of the Shipping Method', type: String, example: '1' })
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  shippingMethodId: bigint;

  @ApiPropertyOptional({ description: 'Payment method', enum: PaymentMethod, example: 'COD' })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Order note', example: 'Giao giờ hành chính' })
  @IsString()
  @IsOptional()
  note?: string;
}
