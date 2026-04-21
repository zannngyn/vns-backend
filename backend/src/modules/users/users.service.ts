import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: bigint) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async create(data: Omit<Prisma.UserCreateInput, 'profile'>, profileData?: Omit<Prisma.UserProfileCreateWithoutUserInput, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.prisma.user.create({
      data: {
        ...data,
        profile: profileData ? { create: profileData } : undefined,
      },
      include: { profile: true },
    });
  }
}
