import { Resolver, Query, Mutation, Args, Subscription, ID, Context } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { pubSub, GQL_EVENTS } from './pubsub';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import {
  User,
  UserRole,
  AuthResponse,
  RegisterInput,
  LoginInput,
  Vehicle,
  CreateVehicleInput,
  GpsPosition,
  AddGpsPositionInput,
  TrafficZone,
  CreateTrafficZoneInput,
  Incident,
  DeclareIncidentInput,
  UpdateIncidentStatusInput,
  Notification,
} from './types';

// --- AUTH RESOLVER ---

@Resolver(() => User)
export class AuthResolver {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput) {
    try {
      return await firstValueFrom(this.authClient.send('auth.register', input));
    } catch (err) {
      throw new Error(err.message || 'Registration failed');
    }
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput) {
    try {
      return await firstValueFrom(this.authClient.send('auth.login', input));
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context: any) {
    const req = context.req;
    const user = req?.user || context.user;
    return user;
  }
}

// --- VEHICLE RESOLVER ---

@Resolver(() => Vehicle)
export class VehicleResolver {
  constructor(
    @Inject('VEHICLE_SERVICE') private readonly vehicleClient: ClientProxy,
  ) {}

  @Mutation(() => Vehicle)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addVehicle(@Args('input') input: CreateVehicleInput) {
    try {
      return await firstValueFrom(this.vehicleClient.send('vehicle.add', input));
    } catch (err) {
      throw new Error(err.message || 'Failed to add vehicle');
    }
  }

  @Query(() => [Vehicle])
  @UseGuards(GqlAuthGuard)
  async vehicles() {
    try {
      return await firstValueFrom(this.vehicleClient.send('vehicle.findAll', {}));
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch vehicles');
    }
  }

  @Query(() => Vehicle)
  @UseGuards(GqlAuthGuard)
  async vehicle(@Args('id', { type: () => ID }) id: number) {
    try {
      return await firstValueFrom(this.vehicleClient.send('vehicle.findOne', { id }));
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch vehicle');
    }
  }

  @Mutation(() => GpsPosition)
  @UseGuards(GqlAuthGuard)
  async addGpsPosition(@Args('input') input: AddGpsPositionInput) {
    try {
      const position = await firstValueFrom(
        this.vehicleClient.send('vehicle.addGpsPosition', input),
      );
      // Publish event for real-time tracking
      pubSub.publish(GQL_EVENTS.GPS_POSITION_ADDED, { vehicleGpsUpdated: position });
      return position;
    } catch (err) {
      throw new Error(err.message || 'Failed to record GPS position');
    }
  }

  @Query(() => [GpsPosition])
  @UseGuards(GqlAuthGuard)
  async gpsHistory(@Args('vehicleId', { type: () => ID }) vehicleId: number) {
    try {
      return await firstValueFrom(
        this.vehicleClient.send('vehicle.getGpsHistory', { vehicleId }),
      );
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch GPS history');
    }
  }

  @Subscription(() => GpsPosition, {
    resolve: (payload) => payload.vehicleGpsUpdated,
  })
  vehicleGpsUpdated() {
    return pubSub.asyncIterableIterator(GQL_EVENTS.GPS_POSITION_ADDED);
  }
}

// --- TRAFFIC RESOLVER ---

@Resolver(() => TrafficZone)
export class TrafficResolver {
  constructor(
    @Inject('TRAFFIC_SERVICE') private readonly trafficClient: ClientProxy,
  ) {}

  @Mutation(() => TrafficZone)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTrafficZone(@Args('input') input: CreateTrafficZoneInput) {
    try {
      return await firstValueFrom(this.trafficClient.send('traffic.createZone', input));
    } catch (err) {
      throw new Error(err.message || 'Failed to create traffic zone');
    }
  }

  @Query(() => [TrafficZone])
  @UseGuards(GqlAuthGuard)
  async trafficZones() {
    try {
      return await firstValueFrom(this.trafficClient.send('traffic.getZones', {}));
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch traffic zones');
    }
  }

  @Query(() => TrafficZone)
  @UseGuards(GqlAuthGuard)
  async trafficDensity(@Args('zoneId', { type: () => ID }) zoneId: number) {
    try {
      return await firstValueFrom(this.trafficClient.send('traffic.getDensity', { zoneId }));
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch traffic density');
    }
  }
}

// --- INCIDENT RESOLVER ---

@Resolver(() => Incident)
export class IncidentResolver {
  constructor(
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy,
  ) {}

  @Mutation(() => Incident)
  @UseGuards(GqlAuthGuard)
  async declareIncident(@Args('input') input: DeclareIncidentInput) {
    try {
      const incident = await firstValueFrom(
        this.incidentClient.send('incident.declare', input),
      );
      pubSub.publish(GQL_EVENTS.INCIDENT_DECLARED, { incidentDeclared: incident });
      return incident;
    } catch (err) {
      throw new Error(err.message || 'Failed to declare incident');
    }
  }

  @Query(() => [Incident])
  @UseGuards(GqlAuthGuard)
  async incidents() {
    try {
      return await firstValueFrom(this.incidentClient.send('incident.findAll', {}));
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch incidents');
    }
  }

  @Mutation(() => Incident)
  @UseGuards(GqlAuthGuard)
  async updateIncidentStatus(@Args('input') input: UpdateIncidentStatusInput) {
    try {
      const incident = await firstValueFrom(
        this.incidentClient.send('incident.updateStatus', input),
      );
      pubSub.publish(GQL_EVENTS.INCIDENT_STATUS_UPDATED, { incidentStatusUpdated: incident });
      return incident;
    } catch (err) {
      throw new Error(err.message || 'Failed to update incident status');
    }
  }

  @Subscription(() => Incident, {
    resolve: (payload) => payload.incidentDeclared,
  })
  incidentDeclared() {
    return pubSub.asyncIterableIterator(GQL_EVENTS.INCIDENT_DECLARED);
  }

  @Subscription(() => Incident, {
    resolve: (payload) => payload.incidentStatusUpdated,
  })
  incidentStatusUpdated() {
    return pubSub.asyncIterableIterator(GQL_EVENTS.INCIDENT_STATUS_UPDATED);
  }
}

// --- NOTIFICATION RESOLVER ---

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
  ) {}

  @Query(() => [Notification])
  @UseGuards(GqlAuthGuard)
  async notifications() {
    try {
      return await firstValueFrom(
        this.notificationClient.send('notification.findAll', {}),
      );
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch notifications');
    }
  }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async markNotificationRead(@Args('id', { type: () => ID }) id: number) {
    try {
      return await firstValueFrom(
        this.notificationClient.send('notification.markAsRead', { id }),
      );
    } catch (err) {
      throw new Error(err.message || 'Failed to mark notification as read');
    }
  }

  @Subscription(() => Notification, {
    resolve: (payload) => payload.notificationAdded,
  })
  notificationAdded() {
    return pubSub.asyncIterableIterator(GQL_EVENTS.NOTIFICATION_ADDED);
  }
}
