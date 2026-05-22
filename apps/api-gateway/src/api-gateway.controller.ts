import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { pubSub, GQL_EVENTS } from './graphql/pubsub';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get()
  getHello(): string {
    return 'Traffic Management API Gateway GraphQL with WebSockets active.';
  }

  @MessagePattern('gateway.onNotification')
  handleOnNotification(@Payload() data: any) {
    pubSub.publish(GQL_EVENTS.NOTIFICATION_ADDED, { notificationAdded: data });
    return { success: true };
  }

  @MessagePattern('gateway.onGpsUpdate')
  handleOnGpsUpdate(@Payload() data: any) {
    pubSub.publish(GQL_EVENTS.GPS_POSITION_ADDED, { vehicleGpsUpdated: data });
    return { success: true };
  }

  @MessagePattern('gateway.onIncident')
  handleOnIncident(@Payload() data: any) {
    pubSub.publish(GQL_EVENTS.INCIDENT_DECLARED, { incidentDeclared: data });
    return { success: true };
  }

  @MessagePattern('gateway.onIncidentStatus')
  handleOnIncidentStatus(@Payload() data: any) {
    pubSub.publish(GQL_EVENTS.INCIDENT_STATUS_UPDATED, { incidentStatusUpdated: data });
    return { success: true };
  }
}
