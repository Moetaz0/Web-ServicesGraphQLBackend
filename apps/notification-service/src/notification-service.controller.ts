import { Controller } from '@nestjs/common';
import { NotificationServiceService } from './notification-service.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationServiceService) {}

  @EventPattern('notification.create')
  async create(@Payload() data: { message: string }) {
    await this.notificationService.create(data);
  }

  @MessagePattern('notification.findAll')
  async findAll() {
    return this.notificationService.findAll();
  }

  @MessagePattern('notification.markAsRead')
  async markAsRead(@Payload() data: { id: number }) {
    return this.notificationService.markAsRead(data.id);
  }
}
