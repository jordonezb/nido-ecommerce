import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'nido-backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
