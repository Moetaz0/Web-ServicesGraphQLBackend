import { Controller } from '@nestjs/common';
import { TrafficServiceService } from './traffic-service.service';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class TrafficServiceController {
  constructor(private readonly trafficService: TrafficServiceService) {}

  @MessagePattern('traffic.createZone')
  async createZone(@Payload() data: any) {
    return this.trafficService.createZone(data);
  }

  @MessagePattern('traffic.getZones')
  async getZones() {
    return this.trafficService.getZones();
  }

  @MessagePattern('traffic.getDensity')
  async getDensity(@Payload() data: { zoneId: number }) {
    return this.trafficService.getDensity(data.zoneId);
  }

  @EventPattern('traffic.onVehicleMoved')
  async handleVehicleMoved(@Payload() data: any) {
    await this.trafficService.handleVehicleMoved(data);
  }
}
