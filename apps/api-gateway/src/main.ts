import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(ApiGatewayModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Configure as a Hybrid Application: HTTP server + TCP Microservice listener
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.GATEWAY_TCP_PORT || '4001'),
    },
  });

  await app.startAllMicroservices();
  logger.log('Gateway TCP microservice started on port 4001');

  const httpPort = parseInt(process.env.GATEWAY_HTTP_PORT || '4000');
  await app.listen(httpPort);
  logger.log(`Gateway GraphQL/HTTP server running on: http://localhost:${httpPort}/graphql`);
}
bootstrap();
