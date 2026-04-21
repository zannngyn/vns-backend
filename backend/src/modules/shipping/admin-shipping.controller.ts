import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Shipping')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/shipping-methods')
export class AdminShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all shipping methods (admin)' })
  async findAll() {
    return this.shippingService.findAllForAdmin();
  }

  @Post()
  @ApiOperation({ summary: 'Create a shipping method' })
  async create(@Body() dto: CreateShippingMethodDto) {
    return this.shippingService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipping method' })
  async update(@Param('id') id: string, @Body() dto: UpdateShippingMethodDto) {
    return this.shippingService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shipping method' })
  async remove(@Param('id') id: string) {
    return this.shippingService.remove(BigInt(id));
  }
}
