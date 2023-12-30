import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
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

    careDemand.careDemand = createCareDemandDto.careDemand;

    return this.careDemandRepository.save(careDemand);
  }

  findAll(projectId: number) {
    return this.careDemandRepository.find({
      where: { project: { id: projectId } },
    });
  }

  async findOne(id: number) {
    try {
      return await this.careDemandRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('CareDemand not found');
    }
  }

  async update(id: number, updateCareDemandDto: UpdateCareDemandDto) {
    const careDemand = await this.findOne(id);

    const { title, careDemand: newCareDemand } = updateCareDemandDto;

    if (title) careDemand.title = title;

    if (newCareDemand) careDemand.careDemand = newCareDemand;
    try {
      return await this.careDemandRepository.save(careDemand);
    } catch (e) {
      throw new HttpException(e, 500);
    }
  }

  async remove(id: number) {
    const careDemand = await this.careDemandRepository.findOne({
      where: { id },
    });
    if (!careDemand) return;
    const deletedCareDemand = await this.careDemandRepository.remove(
      careDemand
    );
    return {
      ...deletedCareDemand,
      id: id,
    };
  }
}
