import { Controller } from '@nestjs/common';
import { VehicleServiceService } from './vehicle-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class VehicleServiceController {
  constructor(private readonly vehicleService: VehicleServiceService) {}

  @MessagePattern('vehicle.add')
  async addVehicle(@Payload() data: any) {
    return this.vehicleService.addVehicle(data);
  }

  @MessagePattern('vehicle.findAll')
  async findAll() {
    return this.vehicleService.findAll();
  }

  @MessagePattern('vehicle.findOne')
  async findOne(@Payload() data: { id: number }) {
    return this.vehicleService.findOne(data.id);
  }

  @MessagePattern('vehicle.addGpsPosition')
  async addGpsPosition(@Payload() data: any) {
    return this.vehicleService.addGpsPosition(data);
  }

  @MessagePattern('vehicle.getGpsHistory')
  async getGpsHistory(@Payload() data: { vehicleId: number }) {
    return this.vehicleService.getGpsHistory(data.vehicleId);
  }
}
