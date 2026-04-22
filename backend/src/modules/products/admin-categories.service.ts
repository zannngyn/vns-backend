import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { products: true } }
      }
    });
  }

  async findOne(id: bigint) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
        description: data.description,
        thumbnail: data.thumbnail,
        isActive: data.isActive ?? true,
      }
    });
  }

  async update(id: bigint, data: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
      }
    });
  }

  async delete(id: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({ where: { id } });
      if (!category) throw new NotFoundException('Category not found');

      // Check if products exist in this category
      const productCount = await tx.product.count({ where: { categoryId: id } });
      if (productCount > 0) {
        // Ensure "Uncategorized" category exists
        let uncategorized = await tx.category.findUnique({ where: { slug: 'uncategorized' } });
        if (!uncategorized) {
          uncategorized = await tx.category.create({
            data: {
              name: 'Uncategorized',
              slug: 'uncategorized',
              description: 'System default category for products without a category.',
              isActive: true,
            }
          });
        }

        // Failsafe if the admin is trying to delete the "Uncategorized" category itself!
        if (category.slug === 'uncategorized') {
          throw new Error("Cannot delete the system 'Uncategorized' fallback category.");
        }

        // Migrate products
        await tx.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: uncategorized.id }
        });
      }

      // Hard delete the category after cleanup
      return tx.category.delete({ where: { id } });
    });
  }
}
