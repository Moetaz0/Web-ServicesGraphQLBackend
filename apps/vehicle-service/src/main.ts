import { NestFactory } from '@nestjs/core';
import { VehicleServiceModule } from './vehicle-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('VehicleService');
  const port = parseInt(process.env.VEHICLE_SERVICE_PORT || '3002');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    VehicleServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: port,
      },
    },
  );
  await app.listen();
  logger.log(`Vehicle Service Microservice is running on TCP port ${port}`);
}
bootstrap();
