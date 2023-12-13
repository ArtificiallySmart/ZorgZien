import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class CreateCareSupplyEntryDto {
  @IsString()
  name: string;

  @IsInt()
  @IsOptional()
  amount?: number;

  @IsString()
  color: string;

  @IsArray()
  @IsString({ each: true })
  areaPostalCodes?: string[];
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
