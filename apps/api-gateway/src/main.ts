import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  await app.listen(process.env.API_GATEWAY_PORT ?? 3000);
  console.log(
    `API Gateway running on http://localhost:${process.env.API_GATEWAY_PORT ?? 3000}/graphql`,
  );
}
bootstrap();
