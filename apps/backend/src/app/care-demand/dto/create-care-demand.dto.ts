import { IsNotEmpty } from 'class-validator';

export class CreateCareDemandDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  careDemand: [number, number][];

  @IsNotEmpty()
  projectId: number;
}
