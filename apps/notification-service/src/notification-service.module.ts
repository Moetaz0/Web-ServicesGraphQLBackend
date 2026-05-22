import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Notification } from './entities/notification.entity';

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
      database: process.env.NOTIFICATION_DB_NAME || 'notification_db',
      entities: [Notification],
      synchronize: true, // Auto-create tables in development
    }),
    TypeOrmModule.forFeature([Notification]),
    ClientsModule.register([
      {
        name: 'GATEWAY_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.GATEWAY_HOST || '127.0.0.1',
          port: parseInt(process.env.GATEWAY_TCP_PORT || '4001'),
        },
      },
    ]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
