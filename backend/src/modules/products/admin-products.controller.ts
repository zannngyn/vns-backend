import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminProductsService } from './admin-products.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Admin Products')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products (admin)' })
  async findAll() {
    return this.adminProductsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product detail' })
  async findOne(@Param('id') id: string) {
    return this.adminProductsService.findOne(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create product with variants' })
  async create(@Body() data: CreateProductDto) {
    return this.adminProductsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product basic info and skus' })
  async update(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.adminProductsService.update(BigInt(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product and variants' })
  async delete(@Param('id') id: string) {
    return this.adminProductsService.delete(BigInt(id));
  }
}

