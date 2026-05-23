import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaClientModule } from '@app/prisma-client';
import { EventsModule } from '@app/common';
import { AuthServiceModule } from '../../auth-service/src/auth-service.module';
import { VehicleServiceModule } from '../../vehicle-service/src/vehicle-service.module';
import { TrafficServiceModule } from '../../traffic-service/src/traffic-service.module';
import { IncidentServiceModule } from '../../incident-service/src/incident-service.module';
import { NotificationServiceModule } from '../../notification-service/src/notification-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaClientModule,
    EventsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    AuthServiceModule,
    VehicleServiceModule,
    TrafficServiceModule,
    IncidentServiceModule,
    NotificationServiceModule,
  ],
})
export class ApiGatewayModule {}
