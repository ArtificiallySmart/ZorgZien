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
import { CareDemandList } from './entities/care-demand-list.entity';

@Controller('care-demand')
export class CareDemandController {
  constructor(private readonly careDemandService: CareDemandService) {}

  @Post()
  create(@Body() createCareDemandDto: CreateCareDemandDto) {
    return this.careDemandService.create(createCareDemandDto);
  }

  @Get(':projectId')
  async findOne(@Param('projectId') projectId: string) {
    const test = await this.careDemandService.findAll(+projectId);
    return test as CareDemandList[];
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
