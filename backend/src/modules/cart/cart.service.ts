import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: bigint) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            sku: {
              include: {
                product: true,
                color: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { sku: { include: { product: true, color: true, size: true } } } } },
      });
    }
    return cart;
  }

  async getCart(userId: bigint) {
    return this.getOrCreateCart(userId);
  }

  async addItem(userId: bigint, dto: AddToCartDto) {
    const sku = await this.prisma.productSku.findUnique({
      where: { id: dto.skuId },
    });

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }
    if (sku.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = cart.items.find(item => item.skuId === dto.skuId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (sku.stock < newQuantity) {
        throw new BadRequestException('Not enough stock available for total quantity');
      }
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          skuId: dto.skuId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: bigint, itemId: bigint, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    const sku = await this.prisma.productSku.findUnique({ where: { id: item.skuId } });
    if (!sku || sku.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId: bigint, itemId: bigint) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }
}
