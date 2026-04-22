import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class AdminCouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: bigint) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(data: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        usageLimit: data.usageLimit,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      }
    });
  }

  async update(id: bigint, data: UpdateCouponDto) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const existing = await this.prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
      if (existing) throw new BadRequestException('Coupon code already exists');
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        code: data.code ? data.code.toUpperCase() : undefined,
        discountType: data.discountType,
        discountValue: data.discountValue !== undefined ? data.discountValue : undefined,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        usageLimit: data.usageLimit,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive,
      }
    });
  }

  async delete(id: bigint) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    // Soft delete to preserve order histories that used this coupon
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
