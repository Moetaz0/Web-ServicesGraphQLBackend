import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './entities/incident.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class IncidentServiceService {
  constructor(
    @InjectRepository(Incident)
    private incidentRepository: Repository<Incident>,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
  ) {}

  async declare(data: any) {
    const incident = this.incidentRepository.create(data);
    const saved = await this.incidentRepository.save(incident);

    // Notify about the new incident
    this.notificationClient.emit('notification.create', {
      message: `NOUVEL INCIDENT: ${saved.type} déclaré (${saved.description}).`,
    });

    return saved;
  }

  async findAll() {
    return await this.incidentRepository.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(data: { id: number; status: any }) {
    const incident = await this.incidentRepository.findOne({ where: { id: data.id } });
    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    incident.status = data.status;
    const updated = await this.incidentRepository.save(incident);

    this.notificationClient.emit('notification.create', {
      message: `MISE A JOUR INCIDENT: Le statut de l'incident #${updated.id} (${updated.type}) est passé à "${updated.status}".`,
    });

    return updated;
  }
}
