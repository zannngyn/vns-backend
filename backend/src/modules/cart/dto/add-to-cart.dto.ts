import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'SKU ID to add' })
  @IsNotEmpty()
  @Transform(({ value }) => BigInt(value))
  skuId: bigint;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
