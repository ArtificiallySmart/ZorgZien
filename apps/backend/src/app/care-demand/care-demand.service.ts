import { Injectable } from '@nestjs/common';
import { CreateCareDemandDto } from './dto/create-care-demand.dto';
import { UpdateCareDemandDto } from './dto/update-care-demand.dto';
import { CareDemand } from './entities/care-demand.entity';
import { DataSource } from 'typeorm';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class CareDemandService {
  constructor(private dataSource: DataSource) {}
  careDemandRepository = this.dataSource.getRepository(CareDemand);
  projectRepository = this.dataSource.getRepository(Project);

  async create(createCareDemandDto: CreateCareDemandDto) {
    const careDemand = new CareDemand();
    careDemand.project = await this.projectRepository.findOne({
      where: { id: createCareDemandDto.projectId },
    });
    careDemand.title = createCareDemandDto.title;

    careDemand.careDemand = Object.fromEntries(createCareDemandDto.careDemand);

    return this.careDemandRepository.save(careDemand);
  }

  findAll(projectId: number) {
    return this.careDemandRepository.find({
      where: { project: { id: projectId } },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} careDemand`;
  }

  update(id: number, updateCareDemandDto: UpdateCareDemandDto) {
    return `this returns ${id} and ${updateCareDemandDto}`;
  }

  async remove(id: number) {
    const careDemand = await this.careDemandRepository.findOne({
      where: { id },
    });
    if (!careDemand) return;
    const careNeed = await this.careDemandRepository.remove(careDemand);
    return {
      ...careNeed,
      id: id,
    };
  }
}
