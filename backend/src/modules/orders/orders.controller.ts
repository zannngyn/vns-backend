import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order from current cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully.' })
  @ApiResponse({ status: 400, description: 'Cart is empty or stock insufficient.' })
  async create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(BigInt(user.id), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user order history' })
  @ApiResponse({ status: 200, description: 'List of orders.' })
  async findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(BigInt(user.id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order details.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findOne(BigInt(user.id), BigInt(id));
  }

  @Get(':id/payment')
  @ApiOperation({ summary: 'Get payment info for an order' })
  @ApiResponse({ status: 200, description: 'Payment details.' })
  @ApiResponse({ status: 404, description: 'Order or payment not found.' })
  async getPayment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getPayment(BigInt(user.id), BigInt(id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (only allowed when PENDING)' })
  @ApiResponse({ status: 200, description: 'Order cancelled, stock restored.' })
  @ApiResponse({ status: 400, description: 'Cannot cancel order in current status.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(BigInt(user.id), BigInt(id));
  }
}
