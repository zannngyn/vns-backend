import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class AdminBrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { products: true } }
      }
    });
  }

  async findOne(id: bigint) {
    const brand = await this.prisma.brand.findUnique({
      where: { id }
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async create(data: CreateBrandDto) {
    return this.prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
        description: data.description,
        logo: data.logo,
        origin: data.origin,
        isActive: data.isActive ?? true,
      }
    });
  }

  async update(id: bigint, data: UpdateBrandDto) {
    const existing = await this.prisma.brand.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Brand not found');

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...data,
      }
    });
  }

  async delete(id: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const brand = await tx.brand.findUnique({ where: { id } });
      if (!brand) throw new NotFoundException('Brand not found');

      // Check if products exist in this brand
      const productCount = await tx.product.count({ where: { brandId: id } });
      if (productCount > 0) {
        // Ensure "Unbranded" brand exists
        let unbranded = await tx.brand.findUnique({ where: { slug: 'unbranded' } });
        if (!unbranded) {
          unbranded = await tx.brand.create({
            data: {
              name: 'Unbranded',
              slug: 'unbranded',
              description: 'System default brand for unbranded products.',
              isActive: true,
            }
          });
        }

        if (brand.slug === 'unbranded') {
          throw new Error("Cannot delete the system 'Unbranded' fallback brand.");
        }

        // Migrate products
        await tx.product.updateMany({
          where: { brandId: id },
          data: { brandId: unbranded.id }
        });
      }

      // Hard delete the brand after cleanup
      return tx.brand.delete({ where: { id } });
    });
  }
}
