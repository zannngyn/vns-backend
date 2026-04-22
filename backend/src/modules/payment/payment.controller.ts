import { Body, Controller, Get, Param, Post, Req, Res, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SepayService } from './sepay.service';
import { OrdersService } from '../orders/orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';
import type { Request, Response } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly sepayService: SepayService,
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * POST /payments/sepay/checkout/:orderId
   * Generate a SePay checkout URL for the given order.
   * Called by the frontend after order creation when paymentMethod = SEPAY.
   */
  @Post('sepay/checkout/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SePay checkout for an order' })
  @ApiResponse({ status: 200, description: 'Returns checkoutUrl and form fields' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async createSepayCheckout(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.ordersService.findOne(BigInt(user.id), BigInt(orderId));

    // Update payment method to SEPAY
    await this.prisma.payment.update({
      where: { orderId: BigInt(orderId) },
      data: { method: PaymentMethod.SEPAY, provider: 'SePay' },
    });

    // Generate a unique invoice number using order ID
    const invoiceNumber = `VNS-${String(order.id).padStart(8, '0')}`;
    const amount = Number(order.totalAmount);

    const checkout = this.sepayService.createCheckout({
      orderInvoiceNumber: invoiceNumber,
      amount,
      description: `Thanh toan don hang ${invoiceNumber}`,
      customerId: String(user.id),
    });

    // Save the invoice number as transactionId for later lookup
    await this.prisma.payment.update({
      where: { orderId: BigInt(orderId) },
      data: { transactionId: invoiceNumber },
    });

    return checkout;
  }

  /**
   * POST /payments/sepay/webhook
   * SePay will call this endpoint to notify payment status changes.
   * This endpoint is PUBLIC (no JWT required).
   */
  @Post('sepay/webhook')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'SePay webhook callback' })
  async sepayWebhook(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    // SePay sends: { order_invoice_number, order_status, ... }
    const invoiceNumber = body.order_invoice_number;
    const orderStatus = body.order_status;

    if (!invoiceNumber) {
      return res.status(400).json({ message: 'Missing order_invoice_number' });
    }

    // Find payment by transactionId (our invoice number)
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: invoiceNumber },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Map SePay status to our PaymentStatus
    if (orderStatus === 'COMPLETED' || orderStatus === 'PAID') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Auto-confirm the order when payment is received
      if (payment.order.status === 'PENDING') {
        await this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' },
        });
      }
    } else if (orderStatus === 'FAILED' || orderStatus === 'ERROR') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    } else if (orderStatus === 'CANCELLED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return res.json({ success: true });
  }

  /**
   * GET /payments/sepay/status/:orderId
   * Frontend polls this to check if SePay payment was completed.
   */
  @Get('sepay/status/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check SePay payment status for an order' })
  async checkSepayStatus(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.ordersService.findOne(BigInt(user.id), BigInt(orderId));

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    return {
      orderId: String(order.id),
      paymentStatus: payment?.status || 'UNKNOWN',
      paidAt: payment?.paidAt || null,
      method: payment?.method || null,
    };
  }
}
