import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLoggerService } from './infrastructure/external/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Use custom logger
  });

  // Use custom logger
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Zero-Trust Network Security API')
    .setDescription('API for managing Kubernetes Network Policies and RBAC')
    .setVersion('1.0')
    .addTag('policies')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`Zero-Trust Network Security Service started on port ${port}`, 'Bootstrap');
}

bootstrap();

