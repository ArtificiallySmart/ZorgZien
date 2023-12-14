import { Injectable } from '@nestjs/common';
import { CreateCareSupplyListDto } from './dto/create-care-supply.dto';
import { UpdateCareSupplyListDto } from './dto/update-care-supply.dto';
import { DataSource } from 'typeorm';
import { CareSupplyList } from './entities/care-supply-list.entity';
import { Project } from '../projects/entities/project.entity';
import { CareSupplyEntry } from './entities/care-supply-entry.entity';

@Injectable()
export class CareSupplyService {
  constructor(private dataSource: DataSource) {}
  careSupplyRepository = this.dataSource.getRepository(CareSupplyList);
  projectRepository = this.dataSource.getRepository(Project);

  async create(createCareSupplyListDto: CreateCareSupplyListDto) {
    const careSupply = new CareSupplyList();
    const careSupplyEntries: CareSupplyEntry[] = [];
    createCareSupplyListDto.careSupply.forEach((entry) => {
      const careSupplyEntry = new CareSupplyEntry();
      careSupplyEntry.name = entry.name;
      careSupplyEntry.amount = entry.amount ?? 0;
      careSupplyEntry.areaPostalCodes = entry.areaPostalCodes;
      careSupplyEntry.color = entry.color;
      careSupplyEntries.push(careSupplyEntry);
    });
    careSupply.project = await this.projectRepository.findOne({
      where: { id: createCareSupplyListDto.projectId },
    });
    careSupply.title = createCareSupplyListDto.title;
    careSupply.careSupply = careSupplyEntries;

    return this.careSupplyRepository.save(careSupply);
  }

  findAll() {
    return `This action returns all careSupply`;
  }

  findOne(id: number) {
    return this.careSupplyRepository.find({
      where: { project: { id: id } },
      relations: ['careSupply'],
    });
  }

  update(id: number, updateCareSupplyListDto: UpdateCareSupplyListDto) {
    return `This action updates a #${id} careSupply ${updateCareSupplyListDto}}`;
  }

  async remove(id: string) {
    const careSupply = await this.careSupplyRepository.findOne({
      where: { id },
      relations: ['careSupply'],
    });
    if (!careSupply) return;
    const removedCareSupply = await this.careSupplyRepository.remove(
      careSupply
    );
    return {
      ...removedCareSupply,
      id: id,
    };
  }
}
