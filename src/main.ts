import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Tillad frontenden at kalde backenden fra et andet domæne/port.
  // CORS_ORIGIN er en kommasepareret liste. Er den tom, må alle.
  const origins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : true }); // Tillad alle domæner, hvis CORS_ORIGIN ikke er defineret
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
