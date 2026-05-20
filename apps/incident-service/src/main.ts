import { NestFactory } from '@nestjs/core';
import { IncidentServiceModule } from './incident-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IncidentServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
