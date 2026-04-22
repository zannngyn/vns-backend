import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBrandDto {
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() origin?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
