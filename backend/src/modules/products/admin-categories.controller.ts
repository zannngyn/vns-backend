import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.prisma.category.findMany();
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() data: { name: string; slug: string }) {
    return this.prisma.category.create({ data });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Body() data: { name?: string; slug?: string }) {
    return this.prisma.category.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  async delete(@Param('id') id: string) {
    return this.prisma.category.delete({
      where: { id: BigInt(id) },
    });
  }
}
