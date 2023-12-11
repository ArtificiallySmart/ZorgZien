import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateCareSupplyEntryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  amount?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  areaPostalCodes?: string[];
}

export class UpdateCareSupplyListDto {
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
