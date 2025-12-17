import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

async function bootstrap() {
  console.log('--- BOOTSTRAPPING NESTJS APPLICATION ---');
  console.log('Processing environment...');
  const app = await NestFactory.create(AppModule);

  // Security Middlewares
  app.use(helmet());
  // app.use(mongoSanitize());

  // CORS Configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Adjust for production
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global Prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('JOM Academy API')
    .setDescription('The JOM Academy Platform API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
}
bootstrap();
