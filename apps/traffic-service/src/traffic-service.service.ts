import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrafficZone, DensityClass } from './entities/traffic-zone.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class TrafficServiceService {
  private readonly logger = new Logger(TrafficServiceService.name);

  // In-memory cache to count active vehicles per zone, based on recent positions
  private activeVehiclesPerZone: Map<number, Set<number>> = new Map();

  constructor(
    @InjectRepository(TrafficZone)
    private zoneRepository: Repository<TrafficZone>,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  async createZone(data: any) {
    const zone = this.zoneRepository.create(data);
    const saved = await this.zoneRepository.save(zone);
    this.activeVehiclesPerZone.set(saved.id, new Set());
    return saved;
  }

  async getZones() {
    return await this.zoneRepository.find();
  }

  async getDensity(zoneId: number) {
    return await this.zoneRepository.findOne({ where: { id: zoneId } });
  }

  async handleVehicleMoved(gpsPosition: any) {
    const zones = await this.zoneRepository.find();
    const { vehicleId, latitude, longitude } = gpsPosition;

    for (const zone of zones) {
      if (!this.activeVehiclesPerZone.has(zone.id)) {
        this.activeVehiclesPerZone.set(zone.id, new Set());
      }
      const vehicleSet = this.activeVehiclesPerZone.get(zone.id);

      // Check if vehicle is inside the zone bounding box
      if (
        latitude >= zone.latMin &&
        latitude <= zone.latMax &&
        longitude >= zone.lngMin &&
        longitude <= zone.lngMax
      ) {
        vehicleSet.add(vehicleId);
      } else {
        vehicleSet.delete(vehicleId);
      }

      const count = vehicleSet.size;
      let newClass = DensityClass.FAIBLE;
      if (count >= 6) {
        newClass = DensityClass.ELEVE;
      } else if (count >= 3) {
        newClass = DensityClass.MOYEN;
      }

      // Update zone if status or count changed
      if (zone.vehicleCount !== count || zone.densityClass !== newClass) {
        zone.vehicleCount = count;
        zone.densityClass = newClass;
        await this.zoneRepository.save(zone);

        this.logger.log(`Zone ${zone.name} updated: ${count} vehicles (${newClass})`);

        // Emit notification if density becomes ELEVE
        if (newClass === DensityClass.ELEVE) {
          this.notificationClient.emit('notification.create', {
            message: `ALERTE CONGESTION: La zone ${zone.name} est très encombrée (${count} véhicules).`,
          });
        }
      }
    }
  }
}
