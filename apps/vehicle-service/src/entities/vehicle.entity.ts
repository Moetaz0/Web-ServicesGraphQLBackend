import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  plateNumber: string;

  @Column()
  model: string;

  @Column()
  type: string;

  @Column({ default: 'Active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
