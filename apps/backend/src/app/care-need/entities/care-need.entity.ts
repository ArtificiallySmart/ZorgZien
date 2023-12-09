import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class CareNeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('jsonb')
  careNeed: { [k: string]: number };

  @CreateDateColumn()
  startDate: Date;

  @ManyToOne(() => Project, (project) => project.careNeeds)
  project: Project;
}
