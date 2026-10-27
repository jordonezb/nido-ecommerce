import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { AiModule } from './ai/ai.module';
import { ProductsModule } from './products/products.module';
import { GiftsModule } from './gifts/gifts.module';
import { PaymentsModule } from './payments/payments.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    RealtimeModule,
    BootstrapModule,
    AiModule,
    ProductsModule,
    GiftsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
