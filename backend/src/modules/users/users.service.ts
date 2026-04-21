import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

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

  // --- PROFILE ---

  async updateProfile(userId: bigint, dto: UpdateProfileDto) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });

    if (profile) {
      return this.prisma.userProfile.update({
        where: { userId },
        data: dto,
      });
    } else {
      return this.prisma.userProfile.create({
        data: {
          userId,
          ...dto,
        },
      });
    }
  }

  // --- ADDRESSES ---

  async getAddresses(userId: bigint) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createAddress(userId: bigint, dto: CreateAddressDto) {
    // If it's the first address, or isDefault is true, set the new address as default
    // We should untoggle others if isDefault is true
    const count = await this.prisma.address.count({ where: { userId } });
    let isDefault = count === 0 ? true : (dto.isDefault ?? false);

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          ...dto,
          userId,
          isDefault,
        },
      });
    });
  }

  async updateAddress(userId: bigint, addressId: bigint, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: addressId }, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: dto,
      });
    });
  }

  async deleteAddress(userId: bigint, addressId: bigint) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    // If we deleted the default, set another one to default
    if (address.isDefault) {
      const remainingAddress = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remainingAddress) {
        await this.prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefaultAddress(userId: bigint, addressId: bigint) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      }),
    ]);

    return this.getAddresses(userId);
  }
}
