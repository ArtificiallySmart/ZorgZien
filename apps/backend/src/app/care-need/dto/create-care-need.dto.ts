import { IsNotEmpty } from 'class-validator';

export class CreateCareNeedDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  careNeed: [number, number][];

  @IsNotEmpty()
  projectId: number;
}
