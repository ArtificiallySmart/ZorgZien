import { PartialType } from '@nestjs/mapped-types';
import { CreateCareNeedDto } from './create-care-need.dto';

export class UpdateCareNeedDto extends PartialType(CreateCareNeedDto) {}
