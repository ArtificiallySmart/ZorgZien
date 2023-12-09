import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CareNeed } from '../../care-need/entities/care-need.entity';

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

  @OneToMany(() => CareNeed, (careNeed) => careNeed.project)
  careNeeds: CareNeed[];
}
