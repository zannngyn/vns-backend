import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminCouponsService } from './admin-coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@ApiTags('Admin Coupons')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/coupons')
export class AdminCouponsController {
  constructor(private readonly adminCouponsService: AdminCouponsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  async findAll() {
    return this.adminCouponsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single coupon' })
  async findOne(@Param('id') id: string) {
    return this.adminCouponsService.findOne(BigInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create coupon' })
  async create(@Body() data: CreateCouponDto) {
    return this.adminCouponsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon' })
  async update(@Param('id') id: string, @Body() data: UpdateCouponDto) {
    return this.adminCouponsService.update(BigInt(id), data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete coupon' })
  async delete(@Param('id') id: string) {
    return this.adminCouponsService.delete(BigInt(id));
  }
}
