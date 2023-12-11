import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { CareSupplyEntry } from './care-supply-entry.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class CareSupplyList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @OneToMany(
    () => CareSupplyEntry,
    (careSupplyEntry) => careSupplyEntry.careSupplyList,
    {
      cascade: true,
    }
  )
  careSupply: CareSupplyEntry[];

  @ManyToOne(() => Project, (project) => project.careSupplyLists)
  project: Project;
}
