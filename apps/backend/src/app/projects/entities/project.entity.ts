import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  startDate: Date;

  @UpdateDateColumn()
  lastOpened: Date;

  @Column()
  provinces: string;

  @Column({ nullable: true })
  careNeeds: string;
}
