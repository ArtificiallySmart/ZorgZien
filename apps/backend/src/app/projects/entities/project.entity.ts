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

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  startDate: Date;

  @UpdateDateColumn()
  lastOpened: Date;

  @Column({ nullable: true })
  provinces: string;

  @Column({ nullable: true })
  careNeeds: string;
}
