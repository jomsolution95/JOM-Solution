import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

async function bootstrap() {
  console.log('--- BOOTSTRAPPING NESTJS APPLICATION ---');
  console.log('Forcing rebuild for LoginDto update...');
  console.log('Processing environment...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from 'uploads' directory
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Serving static assets from:', uploadsPath);

  app.use('/uploads', (req: any, res: any, next: any) => {
    console.log('Static asset request:', req.url);
    next();
  });

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  // Security Middlewares
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
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
    forbidNonWhitelisted: false, // TEMPORARY: Disabled to allow 'role' property while DTO update propagates
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
  console.log('Server restart forced.');
}
bootstrap();
