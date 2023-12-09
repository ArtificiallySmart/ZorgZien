import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class CreateCareNeedDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Transform(({ value }) => Array.from(value.entries()))
  careNeed: Map<number, number>;

  @IsNotEmpty()
  projectId: number;
}
