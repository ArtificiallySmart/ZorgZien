import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class CreateCareDemandDto {
  @IsNotEmpty()
  title: string;

  @ArrayNotEmpty()
  @IsArray()
  @Type(() => CreateCareDemandEntryDto)
  @ValidateNested({ each: true })
  careDemand: CreateCareDemandEntryDto[];

  @IsNotEmpty()
  projectId: number;
}

export class CreateCareDemandEntryDto {
  @IsNotEmpty()
  zipcode: number;

  @IsNotEmpty()
  clients: number;

  @IsNotEmpty()
  hours: number;
}
