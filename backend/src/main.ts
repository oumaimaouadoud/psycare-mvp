import 'reflect-metadata';
import cookieParser from 'cookie-parser';

import helmetModule from 'helmet';



import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';


const helmet = helmetModule as unknown as () => any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`PsyCare API: http://localhost:${port}/api`);
}

void bootstrap();
