import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DensityClass {
  FAIBLE = 'Faible',
  MOYEN = 'Moyen',
  ELEVE = 'Élevé',
}

@Entity('traffic_zones')
export class TrafficZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  latMin: number;

  @Column('float')
  latMax: number;

  @Column('float')
  lngMin: number;

  @Column('float')
  lngMax: number;

  @Column({ default: 0 })
  vehicleCount: number;

  @Column({
    type: 'enum',
    enum: DensityClass,
    default: DensityClass.FAIBLE,
  })
  densityClass: DensityClass;

  @CreateDateColumn()
  createdAt: Date;
}
