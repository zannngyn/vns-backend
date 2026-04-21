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
      include: { category: true, brand: true },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create minimal product' })
  async create(@Body() data: { name: string; slug: string; categoryId: string; brandId: string; gender?: Gender; description?: string }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId: BigInt(data.categoryId),
        brandId: BigInt(data.brandId),
        gender: data.gender || Gender.UNISEX,
        description: data.description,
      },
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product basic info' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.prisma.product.update({
      where: { id: BigInt(id) },
      data, // Need proper mapping for BigInt in real scenarios
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
