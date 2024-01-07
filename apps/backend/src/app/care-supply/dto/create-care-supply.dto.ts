import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CreateCareSupplyEntryDto {
  @IsString()
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  amount?: number;

  @IsString()
  color: string;

  @IsArray()
  @IsString({ each: true })
  areaZipcodes?: string[];
}

export class CreateCareSupplyListDto {
  @IsString()
  title: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateCareSupplyEntryDto)
  @ValidateNested({ each: true })
  careSupply: CreateCareSupplyEntryDto[];

  @IsInt()
  projectId: number;
}
