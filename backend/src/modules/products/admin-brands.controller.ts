import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Brands')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  async findAll() {
    return this.prisma.brand.findMany();
  }

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  async create(@Body() data: { name: string; slug: string; logo?: string }) {
    return this.prisma.brand.create({ data });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  async update(@Param('id') id: string, @Body() data: { name?: string; slug?: string; logo?: string }) {
    return this.prisma.brand.update({
      where: { id: BigInt(id) },
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  async delete(@Param('id') id: string) {
    return this.prisma.brand.delete({
      where: { id: BigInt(id) },
    });
  }
}
