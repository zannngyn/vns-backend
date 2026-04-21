import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(BigInt(user.id));
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to cart' })
  async addItem(@CurrentUser() user: any, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(BigInt(user.id), dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(BigInt(user.id), BigInt(id), dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cartService.removeItem(BigInt(user.id), BigInt(id));
  }
}
