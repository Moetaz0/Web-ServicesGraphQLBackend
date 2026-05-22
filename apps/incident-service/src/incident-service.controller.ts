import { Controller } from '@nestjs/common';
import { IncidentServiceService } from './incident-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class IncidentServiceController {
  constructor(private readonly incidentService: IncidentServiceService) {}

  @MessagePattern('incident.declare')
  async declare(@Payload() data: any) {
    return this.incidentService.declare(data);
  }

  @MessagePattern('incident.findAll')
  async findAll() {
    return this.incidentService.findAll();
  }

  @MessagePattern('incident.updateStatus')
  async updateStatus(@Payload() data: any) {
    return this.incidentService.updateStatus(data);
  }
}
