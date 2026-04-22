import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty() @IsString() name: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() thumbnail?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
