import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CareNeedService } from './care-need.service';
import { CreateCareNeedDto } from './dto/create-care-need.dto';
import { UpdateCareNeedDto } from './dto/update-care-need.dto';

@Controller('care-need')
export class CareNeedController {
  constructor(private readonly careNeedService: CareNeedService) {}

  @Post()
  create(@Body() createCareNeedDto: CreateCareNeedDto) {
    return this.careNeedService.create(createCareNeedDto);
  }

  @Get()
  findAll() {
    return this.careNeedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.careNeedService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCareNeedDto: UpdateCareNeedDto
  ) {
    return this.careNeedService.update(+id, updateCareNeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.careNeedService.remove(+id);
  }
}
