import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserWhitelistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  email: string;
}
