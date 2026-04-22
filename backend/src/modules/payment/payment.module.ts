import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SepayService } from './sepay.service';
import { PaymentController } from './payment.controller';
import { OrdersModule } from '../orders/orders.module';
import { sepayConfig } from '../../config/configs';

@Module({
  imports: [
    ConfigModule.forFeature(sepayConfig),
    OrdersModule,
  ],
  controllers: [PaymentController],
  providers: [SepayService],
  exports: [SepayService],
})
export class PaymentModule {}
