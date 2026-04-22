import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminBrandsService } from './admin-brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@ApiTags('Admin Brands')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly adminBrandsService: AdminBrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  async findAll() {
    return this.adminBrandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single brand' })
  async findOne(@Param('id') id: string) {
    return this.adminBrandsService.findOne(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create brand' })
  async create(@Body() data: CreateBrandDto) {
    return this.adminBrandsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  async update(@Param('id') id: string, @Body() data: UpdateBrandDto) {
    return this.adminBrandsService.update(BigInt(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand (migrates products to Unbranded)' })
  async delete(@Param('id') id: string) {
    return this.adminBrandsService.delete(BigInt(id));
  }
}
