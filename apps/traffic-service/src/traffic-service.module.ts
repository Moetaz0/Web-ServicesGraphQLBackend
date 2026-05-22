import { Module } from '@nestjs/common';
import { TrafficServiceController } from './traffic-service.controller';
import { TrafficServiceService } from './traffic-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TrafficZone } from './entities/traffic-zone.entity';

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
      database: process.env.TRAFFIC_DB_NAME || 'traffic_db',
      entities: [TrafficZone],
      synchronize: true, // Auto-create tables in development
    }),
    TypeOrmModule.forFeature([TrafficZone]),
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
  controllers: [TrafficServiceController],
  providers: [TrafficServiceService],
})
export class TrafficServiceModule {}
