import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CareSupplyList } from './care-supply-list.entity';

@Entity()
export class CareSupplyEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column({ nullable: true, type: 'int' })
  amount?: number;

  @Column('simple-array', { nullable: true })
  areaPostalCodes?: string[];

  @ManyToOne(
    () => CareSupplyList,
    (careSupplyList) => careSupplyList.careSupply
  )
  @JoinColumn({ name: 'careSupplyListId' })
  careSupplyList: CareSupplyList;
}
