import { Module } from '@nestjs/common';
import { VehicleServiceController } from './vehicle-service.controller';
import { VehicleServiceService } from './vehicle-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Vehicle } from './entities/vehicle.entity';
import { GpsPosition } from './entities/gps-position.entity';

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
      database: process.env.VEHICLE_DB_NAME || 'vehicle_db',
      entities: [Vehicle, GpsPosition],
      synchronize: true, // Auto-create tables in development
    }),
    TypeOrmModule.forFeature([Vehicle, GpsPosition]),
    ClientsModule.register([
      {
        name: 'GATEWAY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GATEWAY_HOST || '127.0.0.1',
          port: parseInt(process.env.GATEWAY_TCP_PORT || '4001'),
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
    ]),
  ],
  controllers: [VehicleServiceController],
  providers: [VehicleServiceService],
})
export class VehicleServiceModule {}
