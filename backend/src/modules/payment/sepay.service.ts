import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SePayPgClient } from 'sepay-pg-node';

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);
  private client: SePayPgClient;

  constructor(private configService: ConfigService) {
    const env = this.configService.get<string>('sepay.env') as 'sandbox' | 'production';
    const merchantId = this.configService.get<string>('sepay.merchantId')!;
    const secretKey = this.configService.get<string>('sepay.secretKey')!;

    this.client = new SePayPgClient({
      env,
      merchant_id: merchantId,
      secret_key: secretKey,
    });

    this.logger.log(`SePay client initialized in [${env}] mode for merchant [${merchantId}]`);
  }

  /**
   * Generate SePay checkout form data (hidden fields + action URL)
   * for a one-time bank transfer payment.
   */
  createCheckout(params: {
    orderInvoiceNumber: string;
    amount: number;
    description: string;
    customerId?: string;
  }) {
    const successUrl = this.configService.get<string>('sepay.successUrl');
    const cancelUrl = this.configService.get<string>('sepay.cancelUrl');
    const errorUrl = this.configService.get<string>('sepay.errorUrl');

    const fields = this.client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: params.orderInvoiceNumber,
      order_amount: params.amount,
      currency: 'VND',
      order_description: params.description,
      customer_id: params.customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      error_url: errorUrl,
    });

    const checkoutUrl = this.client.checkout.initCheckoutUrl();

    this.logger.log(`Checkout created for order [${params.orderInvoiceNumber}], amount: ${params.amount} VND`);

    return {
      checkoutUrl,
      fields,
    };
  }

  /**
   * Retrieve order status from SePay API
   */
  async getOrderStatus(orderInvoiceNumber: string) {
    return this.client.order.retrieve(orderInvoiceNumber);
  }

  /**
   * Cancel an order on SePay side (for QR-based payments)
   */
  async cancelOrder(orderInvoiceNumber: string) {
    return this.client.order.cancel(orderInvoiceNumber);
  }
}
