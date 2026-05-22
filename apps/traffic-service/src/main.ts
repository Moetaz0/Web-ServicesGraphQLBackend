import { NestFactory } from '@nestjs/core';
import { TrafficServiceModule } from './traffic-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('TrafficService');
  const port = parseInt(process.env.TRAFFIC_SERVICE_PORT || '3003');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TrafficServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: port,
      },
    },
  );
  await app.listen();
  logger.log(`Traffic Service Microservice is running on TCP port ${port}`);
}
bootstrap();
