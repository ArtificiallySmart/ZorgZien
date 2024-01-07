import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CareSupplyList } from './care-supply-list.entity';
import { ColumnNumericTransformer } from '../../shared/transformers/decimal-column.transformer';

@Entity()
export class CareSupplyEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column('numeric', {
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  amount?: number;

  @Column('simple-array', { nullable: true })
  areaZipcodes?: string[];

  @ManyToOne(
    () => CareSupplyList,
    (careSupplyList) => careSupplyList.careSupply,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'careSupplyListId' })
  careSupplyList: CareSupplyList;
}
