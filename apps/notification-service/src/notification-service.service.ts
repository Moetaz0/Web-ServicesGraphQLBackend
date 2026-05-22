import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationServiceService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject('GATEWAY_SERVICE') private gatewayClient: ClientProxy,
  ) {}

  async create(data: { message: string }) {
    const notification = this.notificationRepository.create(data);
    const saved = await this.notificationRepository.save(notification);

    // Broadcast the notification to the API Gateway for real-time WebSocket push
    this.gatewayClient.emit('gateway.onNotification', saved);

    return saved;
  }

  async findAll() {
    return await this.notificationRepository.find({ order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: number) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }
}
