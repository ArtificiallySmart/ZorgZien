import { Injectable, NotFoundException } from '@nestjs/common';
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
  careSupplyEntryRepository = this.dataSource.getRepository(CareSupplyEntry);
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

  findOne(projectId: number) {
    return this.careSupplyRepository.find({
      where: { project: { id: projectId } },
      relations: ['careSupply'],
    });
  }

  async update(id: string, updateCareSupplyListDto: UpdateCareSupplyListDto) {
    const careSupplyList = await this.careSupplyRepository.findOne({
      where: { id },
      relations: ['careSupply'],
    });

    if (!careSupplyList) throw new NotFoundException();

    const { title, careSupply: newCareSupplyEntries } = updateCareSupplyListDto;

    if (title) careSupplyList.title = title;

    if (!newCareSupplyEntries)
      return this.careSupplyRepository.save(careSupplyList);

    const oldCareSupplyEntries = careSupplyList.careSupply;

    careSupplyList.careSupply = [];

    for (const newEntry of newCareSupplyEntries) {
      const newCareSupplyEntry = new CareSupplyEntry();
      newCareSupplyEntry.name = newEntry.name;
      newCareSupplyEntry.amount = newEntry.amount ?? 0;
      newCareSupplyEntry.color = newEntry.color;
      newCareSupplyEntry.areaPostalCodes = newEntry.areaPostalCodes;
      careSupplyList.careSupply.push(newCareSupplyEntry);
    }

    try {
      await this.removeCareSupplyEntries(oldCareSupplyEntries);
    } catch (error) {
      throw new Error(error);
    }

    return this.careSupplyRepository.save(careSupplyList);
  }

  async removeCareSupplyEntries(entries: CareSupplyEntry[]) {
    entries.forEach(async (entry) => {
      await this.careSupplyEntryRepository.remove(entry);
    });
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
