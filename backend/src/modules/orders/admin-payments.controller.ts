import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Payments')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/payments')
export class AdminPaymentsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Patch(':paymentId/status')
  @ApiOperation({ summary: 'Update payment status (PAID, REFUNDED, FAILED)' })
  @ApiResponse({ status: 200, description: 'Payment status updated.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async updatePaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.ordersService.updatePaymentStatus(BigInt(paymentId), dto);
  }
}
