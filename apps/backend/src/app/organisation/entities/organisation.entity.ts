import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Project)
  @JoinTable()
  projects: Project[];

  @OneToMany(() => UserEntity, (user) => user.organisation)
  users: UserEntity[];
}
