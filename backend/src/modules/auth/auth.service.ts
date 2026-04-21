import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create(
      { email: dto.email, passwordHash: hashedPassword },
      { fullName: dto.fullName, phone: dto.phone },
    );

    return this.generateTokens(user.id.toString(), user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id.toString(), user.role);
  }

  async refresh(refreshToken: string) {
    const userId = await this.redisService.get(`refresh_token:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(BigInt(userId));
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Invalidate old refresh token (rotation)
    await this.redisService.del(`refresh_token:${refreshToken}`);

    return this.generateTokens(user.id.toString(), user.role);
  }

  async logout(refreshToken: string) {
    await this.redisService.del(`refresh_token:${refreshToken}`);
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    
    // We could use jwtConfig directly but since we are in a service, using configService is better.
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.accessSecret')!,
      expiresIn: this.configService.get<string>('jwt.accessExpiration') as any,
    });

    const refreshToken = crypto.randomUUID();
    const expiresInStr = this.configService.get<string>('jwt.refreshExpiration', '7d');
    let expireSecs = 7 * 24 * 60 * 60; // 7 days fallback
    if (expiresInStr.endsWith('d')) {
      expireSecs = parseInt(expiresInStr) * 24 * 60 * 60;
    }

    await this.redisService.set(`refresh_token:${refreshToken}`, userId, expireSecs);

    return {
      accessToken,
      refreshToken,
    };
  }
}
