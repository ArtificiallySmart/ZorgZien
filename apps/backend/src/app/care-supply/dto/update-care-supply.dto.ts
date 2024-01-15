import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateCareSupplyEntryDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  areaZipcodes?: string[];
}

export class UpdateCareSupplyListDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @Type(() => UpdateCareSupplyEntryDto)
  @ValidateNested({ each: true })
  @IsOptional()
  careSupply?: UpdateCareSupplyEntryDto[];

  @IsInt()
  @IsOptional()
  projectId?: number;
}
