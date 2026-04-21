import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { fee: 'asc' },
    });
  }

  async findAllForAdmin() {
    return this.prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({
      data: {
        name: dto.name,
        fee: dto.fee,
        estimatedDays: dto.estimatedDays,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: bigint, dto: UpdateShippingMethodDto) {
    await this.findOneOrFail(id);
    return this.prisma.shippingMethod.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.fee !== undefined && { fee: dto.fee }),
        ...(dto.estimatedDays !== undefined && { estimatedDays: dto.estimatedDays }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: bigint) {
    await this.findOneOrFail(id);
    return this.prisma.shippingMethod.delete({ where: { id } });
  }

  private async findOneOrFail(id: bigint) {
    const method = await this.prisma.shippingMethod.findUnique({ where: { id } });
    if (!method) {
      throw new NotFoundException('Shipping method not found');
    }
    return method;
  }
}
