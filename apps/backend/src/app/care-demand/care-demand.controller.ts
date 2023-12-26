import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CareDemandService } from './care-demand.service';
import { CreateCareDemandDto } from './dto/create-care-demand.dto';
import { UpdateCareDemandDto } from './dto/update-care-demand.dto';

@Controller('care-demand')
export class CareDemandController {
  constructor(private readonly careDemandService: CareDemandService) {}

  @Post()
  create(@Body() createCareDemandDto: CreateCareDemandDto) {
    return this.careDemandService.create(createCareDemandDto);
  }

  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.careDemandService.findAll(+projectId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCareDemandDto: UpdateCareDemandDto
  ) {
    return this.careDemandService.update(+id, updateCareDemandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careDemandService.remove(+id);
  }
}
