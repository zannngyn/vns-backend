import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ description: 'Receiver name', example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  receiverName: string;

  @ApiProperty({ description: 'Phone number', example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ description: 'Street address, house number, etc.', example: '123 Nguyen Hue' })
  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @ApiPropertyOptional({ description: 'Ward', example: 'Phuong Ben Nghe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ description: 'District', example: 'Quan 1' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string;

  @ApiProperty({ description: 'City/Province', example: 'Ho Chi Minh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'Is default address', example: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
