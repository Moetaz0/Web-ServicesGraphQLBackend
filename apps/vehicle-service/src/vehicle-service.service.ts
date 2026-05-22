import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { GpsPosition } from './entities/gps-position.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class VehicleServiceService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(GpsPosition)
    private gpsRepository: Repository<GpsPosition>,
    @Inject('GATEWAY_SERVICE') private gatewayClient: ClientProxy,
    @Inject('TRAFFIC_SERVICE') private trafficClient: ClientProxy,
  ) {}

  async addVehicle(data: any) {
    const vehicle = this.vehicleRepository.create(data);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll() {
    return await this.vehicleRepository.find();
  }

  async findOne(id: number) {
    return await this.vehicleRepository.findOne({ where: { id } });
  }

  async addGpsPosition(data: any) {
    const position = this.gpsRepository.create(data);
    const savedPosition = await this.gpsRepository.save(position);

    // Broadcast GPS update to Gateway for GraphQL Subscriptions
    this.gatewayClient.emit('gateway.onGpsUpdate', savedPosition);

    // Notify Traffic Service to update density
    this.trafficClient.emit('traffic.onVehicleMoved', savedPosition);

    return savedPosition;
  }

  async getGpsHistory(vehicleId: number) {
    return await this.gpsRepository.find({
      where: { vehicleId },
      order: { timestamp: 'DESC' },
    });
  }
}
