import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order from cart' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(BigInt(user.id), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user order history' })
  async findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(BigInt(user.id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user order details' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findOne(BigInt(user.id), BigInt(id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (User)' })
  async cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(BigInt(user.id), BigInt(id));
  }
}

