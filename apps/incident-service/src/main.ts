import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IncidentServiceModule } from './incident-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IncidentServiceModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
