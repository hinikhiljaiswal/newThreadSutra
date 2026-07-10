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
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? 'http://localhost:3000').split(','),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 4050;
  try {
    await app.listen(port);
    console.log(`Nest application is listening on port ${port}`);
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please free the port or set a different PORT environment variable.`);
    } else {
      console.error('Failed to start Nest application:', error);
    }
    process.exit(1);
  }
}

bootstrap();
