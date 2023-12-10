import { PartialType } from '@nestjs/mapped-types';
import { CreateCareDemandDto } from './create-care-demand.dto';

export class UpdateCareDemandDto extends PartialType(CreateCareDemandDto) {}
