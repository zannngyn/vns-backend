import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, Gender } from '@prisma/client';

@ApiTags('Admin Products')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (admin)' })
  async findAll() {
    return this.prisma.product.findMany({
      include: { 
        category: true, 
        brand: true,
        skus: {
          include: { color: true, size: true }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create product with variants' })
  async create(@Body() data: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Base Product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/ /g, '-'),
          categoryId: BigInt(data.categoryId),
          brandId: BigInt(data.brandId),
          gender: data.gender || Gender.UNISEX,
          description: data.description,
          material: data.material,
          thumbnail: data.thumbnail,
          isActive: data.isActive ?? true,
        },
      });

      // 2. Process variants (SKUs)
      if (data.skus && Array.isArray(data.skus)) {
        for (const sku of data.skus) {
          const colorName = sku.color?.trim() ? sku.color.trim() : 'N/A';
          const sizeName = sku.size?.trim() ? sku.size.trim() : 'N/A';

          // Upsert color
          let colorId;
          const existingColor = await tx.color.findFirst({ where: { name: colorName } });
          if (existingColor) {
            colorId = existingColor.id;
          } else {
            const newColor = await tx.color.create({
              data: { name: colorName, hexCode: sku.colorHex || '#000000' }
            });
            colorId = newColor.id;
          }

          // Upsert size
          let sizeId;
          const existingSize = await tx.size.findFirst({ where: { name: sizeName } });
          if (existingSize) {
            sizeId = existingSize.id;
          } else {
            const newSize = await tx.size.create({
              data: { name: sizeName, sortOrder: 0 }
            });
            sizeId = newSize.id;
          }

          // Create sku
          await tx.productSku.create({
            data: {
              skuCode: sku.skuCode || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              price: sku.price !== '' ? parseFloat(sku.price) : 0,
              salePrice: sku.salePrice ? parseFloat(sku.salePrice) : null,
              stock: sku.stock !== '' ? parseInt(sku.stock) : 0,
              productId: product.id,
              colorId: colorId,
              sizeId: sizeId,
            }
          });
        }
      }

      return product;
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product basic info' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.product.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  async delete(@Param('id') id: string) {
    return this.prisma.product.delete({
      where: { id: BigInt(id) },
    });
  }
}

