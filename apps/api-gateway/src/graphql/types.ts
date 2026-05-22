import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';

// --- ENUMS ---

export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
}

export enum IncidentType {
  ACCIDENT = 'Accident',
  TRAVAUX = 'Travaux',
  ROUTE_FERMEE = 'Route fermée',
  EMBOUTEILLAGE = 'Embouteillage',
}

export enum IncidentStatus {
  SIGNALE = 'Signalé',
  EN_COURS = 'En cours',
  RESOLU = 'Résolu',
}

export enum DensityClass {
  FAIBLE = 'Faible',
  MOYEN = 'Moyen',
  ELEVE = 'Élevé',
}

registerEnumType(UserRole, { name: 'UserRole' });
registerEnumType(IncidentType, { name: 'IncidentType' });
registerEnumType(IncidentStatus, { name: 'IncidentStatus' });
registerEnumType(DensityClass, { name: 'DensityClass' });

// --- OBJECT TYPES (OUTPUTS) ---

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;
}

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id: number;

  @Field()
  plateNumber: string;

  @Field()
  model: string;

  @Field()
  type: string; // e.g. Car, Truck, Bus

  @Field()
  status: string; // e.g. Active, Inactive

  @Field(() => String)
  createdAt: string;
}

@ObjectType()
export class GpsPosition {
  @Field(() => ID)
  id: number;

  @Field(() => ID)
  vehicleId: number;

  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  speed: number;

  @Field(() => String)
  timestamp: string;
}

@ObjectType()
export class TrafficZone {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  latMin: number;

  @Field()
  latMax: number;

  @Field()
  lngMin: number;

  @Field()
  lngMax: number;

  @Field()
  vehicleCount: number;

  @Field(() => DensityClass)
  densityClass: DensityClass;

  @Field(() => String)
  createdAt: string;
}

@ObjectType()
export class Incident {
  @Field(() => ID)
  id: number;

  @Field(() => IncidentType)
  type: IncidentType;

  @Field(() => IncidentStatus)
  status: IncidentStatus;

  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  description: string;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: number;

  @Field()
  message: string;

  @Field()
  isRead: boolean;

  @Field(() => String)
  createdAt: string;
}

// --- INPUT TYPES ---

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => UserRole, { defaultValue: UserRole.OPERATOR })
  role: UserRole;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class CreateVehicleInput {
  @Field()
  plateNumber: string;

  @Field()
  model: string;

  @Field()
  type: string;

  @Field()
  status: string;
}

@InputType()
export class AddGpsPositionInput {
  @Field(() => ID)
  vehicleId: number;

  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  speed: number;
}

@InputType()
export class CreateTrafficZoneInput {
  @Field()
  name: string;

  @Field()
  latMin: number;

  @Field()
  latMax: number;

  @Field()
  lngMin: number;

  @Field()
  lngMax: number;
}

@InputType()
export class DeclareIncidentInput {
  @Field(() => IncidentType)
  type: IncidentType;

  @Field()
  latitude: number;

  @Field()
  longitude: number;

  @Field()
  description: string;
}

@InputType()
export class UpdateIncidentStatusInput {
  @Field(() => ID)
  id: number;

  @Field(() => IncidentStatus)
  status: IncidentStatus;
}
