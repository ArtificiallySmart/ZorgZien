import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: ['https://kilobryte.nl', 'https://www.kilobryte.nl'],
      credentials: true,
    });
  }
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: ['http://localhost:4200'],
      credentials: true,
    });
  }

  app.use(cookieParser());
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
