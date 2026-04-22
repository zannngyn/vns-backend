import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminCategoriesService } from './admin-categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Admin Categories')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly adminCategoriesService: AdminCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.adminCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category' })
  async findOne(@Param('id') id: string) {
    return this.adminCategoriesService.findOne(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() data: CreateCategoryDto) {
    return this.adminCategoriesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.adminCategoriesService.update(BigInt(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category (migrates products to Uncategorized)' })
  async delete(@Param('id') id: string) {
    return this.adminCategoriesService.delete(BigInt(id));
  }
}
