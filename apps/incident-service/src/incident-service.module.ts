import { Module } from '@nestjs/common';
import { IncidentServiceController } from './incident-service.controller';
import { IncidentServiceService } from './incident-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Incident } from './entities/incident.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.INCIDENT_DB_NAME || 'incident_db',
      entities: [Incident],
      synchronize: true, // Auto-create tables in development
    }),
    TypeOrmModule.forFeature([Incident]),
    ClientsModule.register([
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
  controllers: [IncidentServiceController],
  providers: [IncidentServiceService],
})
export class IncidentServiceModule {}
