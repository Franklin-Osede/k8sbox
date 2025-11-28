import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppLoggerService } from './infrastructure/external/logger.service';
import { ConfigReloadDomainService } from './domain/domain-services/config-reload.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new AppLoggerService(),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Load initial configuration
  const configService = app.get(ConfigReloadDomainService);
  try {
    await configService.loadConfig();
  } catch (error) {
    const logger = new Logger('Bootstrap');
    logger.warn('Failed to load initial config, continuing with empty config');
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ConfigMap Hot-Reload API')
    .setDescription('Zero-downtime configuration reload from ConfigMap volumes')
    .setVersion('1.0')
    .addTag('config', 'Configuration management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
  logger.log(`Config path: ${process.env.CONFIG_PATH || '/config'}`);
}

bootstrap();

