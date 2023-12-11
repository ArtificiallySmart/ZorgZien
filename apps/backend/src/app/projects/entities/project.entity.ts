import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareDemand } from '../../care-demand/entities/care-demand.entity';
import { CareSupplyList } from '../../care-supply/entities/care-supply-list.entity';

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

  @OneToMany(() => CareDemand, (careDemand) => careDemand.project)
  careDemands: CareDemand[];

  @OneToMany(() => CareSupplyList, (careSupplyList) => careSupplyList.project)
  careSupplyLists: CareSupplyList[];
}
