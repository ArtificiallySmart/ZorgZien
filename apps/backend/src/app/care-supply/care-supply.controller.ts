import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CareSupplyService } from './care-supply.service';
import { CreateCareSupplyListDto } from './dto/create-care-supply.dto';
import { UpdateCareSupplyListDto } from './dto/update-care-supply.dto';

@Controller('care-supply')
export class CareSupplyController {
  constructor(private readonly careSupplyService: CareSupplyService) {}

  @Post()
  create(@Body() createCareSupplyListDto: CreateCareSupplyListDto) {
    return this.careSupplyService.create(createCareSupplyListDto);
  }

  @Get()
  findAll() {
    return this.careSupplyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careSupplyService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCareSupplyListDto: UpdateCareSupplyListDto
  ) {
    return this.careSupplyService.update(+id, updateCareSupplyListDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careSupplyService.remove(id);
  }
}
