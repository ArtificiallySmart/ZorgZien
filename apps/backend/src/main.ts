/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const globalPrefix = 'api';
  app.enableCors({
    origin: ['https://kilobryte.nl', 'https://www.kilobryte.nl'],
    credentials: true,
  });
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
