import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. CORS
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Origin blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  // 3. Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Al-Husseiniya API')
    .setDescription(
      'Al-Husseiniya — Year-round humanitarian & community platform architecture API documentation',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Lifecycle Hooks
  app.enableShutdownHooks();

  const port = process.env.APP_PORT || 4000;
  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(` Al-Husseiniya Modular Monolith API Started`);
  logger.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
  logger.log(` Listening on: http://localhost:${port}`);
  logger.log(` Swagger Docs: http://localhost:${port}/api/docs`);
  logger.log(` Health Check: http://localhost:${port}/api/health`);
  logger.log(`====================================================`);
}

bootstrap();
