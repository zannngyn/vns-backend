import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Shipping')
@Controller('shipping-methods')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active shipping methods' })
  async findAll() {
    return this.shippingService.findAll();
  }
}
