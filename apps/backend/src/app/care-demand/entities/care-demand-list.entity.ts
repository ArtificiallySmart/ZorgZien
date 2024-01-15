import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { CareDemandEntry } from './care-demand-entry.entity';

@Entity()
export class CareDemandList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @OneToMany(
    () => CareDemandEntry,
    (careDemandEntry) => careDemandEntry.careDemandList,
    {
      cascade: true,
      onDelete: 'CASCADE',
    }
  )
  careDemand: CareDemandEntry[];

  @ManyToOne(() => Project, (project) => project.careDemands)
  project: Project;
}
