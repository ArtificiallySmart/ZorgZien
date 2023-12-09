import { Injectable } from '@nestjs/common';
import { CreateCareNeedDto } from './dto/create-care-need.dto';
import { UpdateCareNeedDto } from './dto/update-care-need.dto';
import { CareNeed } from './entities/care-need.entity';
import { DataSource } from 'typeorm';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class CareNeedService {
  constructor(private dataSource: DataSource) {}
  careNeedRepository = this.dataSource.getRepository(CareNeed);
  projectRepository = this.dataSource.getRepository(Project);

  async create(createCareNeedDto: CreateCareNeedDto) {
    const careNeed = new CareNeed();
    careNeed.project = await this.projectRepository.findOne({
      where: { id: createCareNeedDto.projectId },
    });
    careNeed.title = createCareNeedDto.title;
    careNeed.careNeed = Object.fromEntries(createCareNeedDto.careNeed);

    return this.careNeedRepository.save(careNeed);
  }

  findAll() {
    return `This action returns all careNeed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} careNeed`;
  }

  update(id: number, updateCareNeedDto: UpdateCareNeedDto) {
    return `This action updates a #${id} careNeed`;
  }

  remove(id: number) {
    return `This action removes a #${id} careNeed`;
  }
}
