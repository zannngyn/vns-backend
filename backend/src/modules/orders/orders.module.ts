import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminPaymentsController } from './admin-payments.controller';

@Module({
  controllers: [OrdersController, AdminOrdersController, AdminPaymentsController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
