import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareDemandList } from '../../care-demand/entities/care-demand-list.entity';
import { CareSupplyList } from '../../care-supply/entities/care-supply-list.entity';
import { Organisation } from '../../organisation/entities/organisation.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  startDate: Date;

  @UpdateDateColumn()
  lastOpened: Date;

  @Column({ nullable: true })
  provinces: string;

  @OneToMany(() => CareDemandList, (careDemandList) => careDemandList.project)
  careDemands: CareDemandList[];

  @OneToMany(() => CareSupplyList, (careSupplyList) => careSupplyList.project)
  careSupplyLists: CareSupplyList[];

  @ManyToMany(() => Organisation, (organisation) => organisation.projects)
  organisations: Organisation[];
}
