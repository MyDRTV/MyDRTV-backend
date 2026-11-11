import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Tillad frontenden at kalde backenden fra et andet domæne/port.
  // CORS_ORIGIN er en kommasepareret liste. Er den tom, må alle.
  const origins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : true });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
