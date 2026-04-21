import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const { q, page = 1, limit = 20, categoryId, brandId, gender, colorId, sizeId, sortBy } = query;
    const skip = (page - 1) * limit;

    let searchQuery: string | undefined = undefined;
    if (q && q.trim().length > 0) {
      // Format for Postgres TSQuery: "ao & thun"
      searchQuery = q.trim().split(/\s+/).join(' & ');
    }

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      categoryId,
      brandId,
      gender,
      ...(searchQuery
        ? {
            OR: [
              { name: { search: searchQuery } },
              { description: { search: searchQuery } },
            ],
          }
        : {}),
    };

    if (colorId || sizeId) {
      where.skus = {
        some: {
          isActive: true,
          ...(colorId && { colorId }),
          ...(sizeId && { sizeId }),
        },
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'relevance' && searchQuery) {
      orderBy = {
        _relevance: {
          fields: ['name', 'description'],
          search: searchQuery,
          sort: 'desc',
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          skus: {
            where: { isActive: true },
            include: { color: true, size: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(slugOrId: string) {
    // Determine if input is ID (number) or slug (string)
    const isId = !isNaN(Number(slugOrId));

    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        ...(isId ? { id: BigInt(slugOrId) } : { slug: slugOrId }),
      },
      include: {
        category: true,
        brand: true,
        skus: {
          where: { isActive: true },
          include: { color: true, size: true },
        },
        styleTags: {
          include: { style: true },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { include: { profile: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length === 0) {
      return [];
    }

    const searchQuery = q.trim().split(/\s+/).join(' & ');

    const results = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { search: searchQuery } },
          { description: { search: searchQuery } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
      },
      orderBy: {
        _relevance: {
          fields: ['name', 'description'],
          search: searchQuery,
          sort: 'desc',
        },
      },
    });

    return results;
  }
}
