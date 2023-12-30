import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class CareDemand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('int', {
    array: true,
  })
  careDemand: [number, number][];

  @CreateDateColumn()
  startDate: Date;

  @ManyToOne(() => Project, (project) => project.careDemands)
  project: Project;
}
