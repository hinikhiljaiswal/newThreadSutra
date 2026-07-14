import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  const webOrigins = process.env.WEB_ORIGIN
    ? process.env.WEB_ORIGIN.split(',')
    : process.env.WEB_ORIGIN_HOST
      ? [`https://${process.env.WEB_ORIGIN_HOST}`]
      : ['http://localhost:3000'];

  app.enableCors({
    origin: webOrigins,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4050);
}

bootstrap();
