import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS flexible para el frontend de Next.js (admite localhost:3000 y otros orígenes)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Validación global estricta de DTOs con transformación automática de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 Nido Backend iniciado exitosamente en http://localhost:${port}`);
  logger.log(`🏥 Health check disponible en http://localhost:${port}/health`);
}

bootstrap();
