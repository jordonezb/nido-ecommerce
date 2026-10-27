import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SimulateCheckoutDto } from './dto/simulate-checkout.dto';

@Controller(['api/payments', 'payments'])
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/checkout (o /payments/checkout)
   * Simula el checkout del regalo o aporte a la Vaca
   */
  @Post(['checkout', 'simulate'])
  async checkout(@Body() dto: SimulateCheckoutDto) {
    return this.paymentsService.processCheckout(dto);
  }
}
