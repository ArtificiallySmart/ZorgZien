import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateCareDemandDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsArray()
  @Type(() => UpdateCareDemandEntryDto)
  @ValidateNested({ each: true })
  @IsOptional()
  careDemand?: UpdateCareDemandEntryDto[];
}

export class UpdateCareDemandEntryDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsNumber()
  @IsOptional()
  zipcode?: number;

  @IsNumber()
  @IsOptional()
  clients?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  hours?: number;
}
