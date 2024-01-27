import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';

import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  const port = process.env.PORT || 3000;

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message:
      'Too many login attempts from this IP, please try again after 15 minutes',
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(globalPrefix);

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: ['https://kilobryte.nl', 'https://www.kilobryte.nl'],
      credentials: true,
    });
  }
  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: ['https://dev.kilobryte.nl'],
      credentials: true,
    });
  }
  if (process.env.NODE_ENV === 'local') {
    app.enableCors({
      origin: ['http://localhost:4200'],
      credentials: true,
    });
  }

  app.use(cookieParser());
  app.use('/loginOtp', loginLimiter);
  app.use('/loginOtpVerify', loginLimiter);
  await app.listen(port);
}

bootstrap();
