import { Controller, Get, Post } from '@nestjs/common';
import { BootstrapService } from './bootstrap.service';

@Controller('api')
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  /**
   * GET /api/bootstrap
   * Retorna { users, products, gifts } incluyendo sus transacciones
   */
  @Get('bootstrap')
  async getBootstrap() {
    return this.bootstrapService.getBootstrapData();
  }

  /**
   * POST /api/demo/reset
   * Limpia GiftOrder y PaymentTransaction y recrea 1 regalo de ejemplo inicial
   */
  @Post('demo/reset')
  async resetDemo() {
    return this.bootstrapService.resetDemo();
  }
}
