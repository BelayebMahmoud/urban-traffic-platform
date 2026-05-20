import { NestFactory } from '@nestjs/core';
import { TrafficServiceModule } from './traffic-service.module';

async function bootstrap() {
  const app = await NestFactory.create(TrafficServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
