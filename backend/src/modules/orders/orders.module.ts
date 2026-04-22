import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminPaymentsController } from './admin-payments.controller';
import { AdminCouponsController } from './admin-coupons.controller';
import { AdminCouponsService } from './admin-coupons.service';

@Module({
  controllers: [OrdersController, AdminOrdersController, AdminPaymentsController, AdminCouponsController],
  providers: [OrdersService, AdminCouponsService],
  exports: [OrdersService, AdminCouponsService],
})
export class OrdersModule {}
