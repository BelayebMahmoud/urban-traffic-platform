import { NestFactory } from '@nestjs/core';
import { VehicleServiceModule } from './vehicle-service.module';

async function bootstrap() {
  const app = await NestFactory.create(VehicleServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
