import { NestFactory } from '@nestjs/core';
import { IncidentServiceModule } from './incident-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('IncidentService');
  const port = parseInt(process.env.INCIDENT_SERVICE_PORT || '3004');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IncidentServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: port,
      },
    },
  );
  await app.listen();
  logger.log(`Incident Service Microservice is running on TCP port ${port}`);
}
bootstrap();
