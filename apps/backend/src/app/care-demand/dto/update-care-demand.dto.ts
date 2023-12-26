import { IsOptional, IsString } from 'class-validator';

export class UpdateCareDemandDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsOptional()
  careDemand: [number, number][];
}
