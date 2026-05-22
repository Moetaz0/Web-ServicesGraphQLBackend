import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import {
  AuthResolver,
  VehicleResolver,
  TrafficResolver,
  IncidentResolver,
  NotificationResolver,
} from './graphql/resolvers';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      playground: true,
      subscriptions: {
        'graphql-ws': true,
      },
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.AUTH_SERVICE_PORT || '3001'),
        },
      },
      {
        name: 'VEHICLE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.VEHICLE_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.VEHICLE_SERVICE_PORT || '3002'),
        },
      },
      {
        name: 'TRAFFIC_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.TRAFFIC_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.TRAFFIC_SERVICE_PORT || '3003'),
        },
      },
      {
        name: 'INCIDENT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INCIDENT_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.INCIDENT_SERVICE_PORT || '3004'),
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.NOTIFICATION_SERVICE_HOST || '127.0.0.1',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3005'),
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController],
  providers: [
    ApiGatewayService,
    AuthResolver,
    VehicleResolver,
    TrafficResolver,
    IncidentResolver,
    NotificationResolver,
    GqlAuthGuard,
    RolesGuard,
  ],
})
export class ApiGatewayModule {}
