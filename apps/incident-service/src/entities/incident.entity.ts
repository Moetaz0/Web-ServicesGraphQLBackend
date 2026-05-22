import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

@Entity('incidents')
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: IncidentType,
  })
  type: IncidentType;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.SIGNALE,
  })
  status: IncidentStatus;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
