import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@viestyle.vn', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
