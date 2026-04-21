import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: bigint, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Cart
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: { sku: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // 2. Validate Address & Shipping Method
      const address = await tx.address.findUnique({ where: { id: dto.addressId } });
      if (!address || address.userId !== userId) {
        throw new NotFoundException('Address not found');
      }

      const shipping = await tx.shippingMethod.findUnique({ where: { id: dto.shippingMethodId } });
      if (!shipping || !shipping.isActive) {
        throw new NotFoundException('Shipping method not available');
      }

      // 3. Calculate Cart Total & Check Stock
      let itemsTotal = 0;
      for (const item of cart.items) {
        if (item.sku.stock < item.quantity) {
          throw new BadRequestException(`Not enough stock for SKU ${item.sku.skuCode}`);
        }
        itemsTotal += Number(item.sku.price) * item.quantity;
      }
      const totalAmount = itemsTotal + Number(shipping.fee);

      // 4. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          addressId: dto.addressId,
          shippingMethodId: dto.shippingMethodId,
          totalAmount,
          shippingFee: shipping.fee,
          note: dto.note,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map((item) => ({
              skuId: item.skuId,
              quantity: item.quantity,
              price: item.sku.price,
            })),
          },
          payment: {
            create: {
              method: PaymentMethod.COD,
              amount: totalAmount,
            }
          }
        },
        include: { items: true, payment: true },
      });

      // 5. Deduct Stock & Clear Cart Items
      for (const item of cart.items) {
        await tx.productSku.update({
          where: { id: item.skuId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

  async findAll(userId: bigint) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        shippingMethod: true,
        payment: true,
        items: {
          include: {
            sku: {
              include: { product: true, color: true, size: true },
            },
          },
        },
      },
    });
  }

  async findOne(userId: bigint, orderId: bigint) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        shippingMethod: true,
        payment: true,
        items: {
          include: {
            sku: {
              include: { product: true, color: true, size: true },
            },
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: bigint, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    
    if (dto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await this.prisma.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of orderItems) {
          await tx.productSku.update({
            where: { id: item.skuId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: orderId },
          data: { status: dto.status },
        });
      });
      return this.prisma.order.findUnique({ where: { id: orderId } });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }

  async cancelOrder(userId: bigint, orderId: bigint) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Bạn chỉ có thể huỷ đơn hàng khi đang ở trạng thái PENDING');
    }

    await this.prisma.$transaction(async (tx) => {
      const orderItems = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        await tx.productSku.update({
          where: { id: item.skuId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    });

    return this.findOne(userId, orderId);
  }

  async findAllForAdmin() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        address: true,
        payment: true,
      },
    });
  }

  async getPayment(userId: bigint, orderId: bigint) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    if (!order.payment) {
      throw new NotFoundException('Payment not found for this order');
    }
    return order.payment;
  }

  async updatePaymentStatus(paymentId: bigint, dto: UpdatePaymentStatusDto) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const data: any = { status: dto.status };
    if (dto.transactionId) data.transactionId = dto.transactionId;
    if (dto.provider) data.provider = dto.provider;

    // Ghi nhận thời điểm thanh toán khi chuyển sang PAID
    if (dto.status === PaymentStatus.PAID) {
      data.paidAt = new Date();
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data,
    });
  }
}
