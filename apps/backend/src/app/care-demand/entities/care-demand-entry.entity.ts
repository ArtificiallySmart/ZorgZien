import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CareDemandList } from './care-demand-list.entity';
import { ColumnNumericTransformer } from '../../shared/transformers/decimal-column.transformer';

/// ColumnNumericTransformer

@Entity()
export class CareDemandEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  zipcode: number;

  @Column({ nullable: true, type: 'int' })
  clients?: number;

  @Column('numeric', {
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  hours?: number;

  @ManyToOne(
    () => CareDemandList,
    (careDemandList) => careDemandList.careDemand,
    {
      onDelete: 'CASCADE',
    }
  )
  @JoinColumn({ name: 'careDemandId' })
  careDemandList: CareDemandList;
}
