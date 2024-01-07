import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCareDemandDto } from './dto/create-care-demand.dto';
import { UpdateCareDemandDto } from './dto/update-care-demand.dto';
import { CareDemandList } from './entities/care-demand-list.entity';
import { DataSource } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { CareDemandEntry } from './entities/care-demand-entry.entity';

@Injectable()
export class CareDemandService {
  constructor(private dataSource: DataSource) {}
  careDemandRepository = this.dataSource.getRepository(CareDemandList);
  careDemandEntryRepository = this.dataSource.getRepository(CareDemandEntry);
  projectRepository = this.dataSource.getRepository(Project);

  async create(createCareDemandDto: CreateCareDemandDto) {
    const careDemand = new CareDemandList();
    const careDemandEntries: CareDemandEntry[] = [];
    createCareDemandDto.careDemand.forEach((entry) => {
      const careDemandEntry = new CareDemandEntry();
      careDemandEntry.zipcode = entry.zipcode;
      careDemandEntry.clients = entry.clients ?? 0;
      careDemandEntry.hours = entry.hours ?? 0;
      careDemandEntries.push(careDemandEntry);
    });
    careDemand.project = await this.projectRepository.findOne({
      where: { id: createCareDemandDto.projectId },
    });
    careDemand.title = createCareDemandDto.title;
    careDemand.careDemand = careDemandEntries;

    return this.careDemandRepository.save(careDemand);
  }

  findAll(projectId: number) {
    return this.careDemandRepository.find({
      where: { project: { id: projectId } },
      relations: ['careDemand'],
    });
  }

  async findOne(id: number) {
    try {
      return await this.careDemandRepository.findOneOrFail({
        where: { id },
        relations: ['careDemand'],
      });
    } catch (error) {
      throw new NotFoundException('CareDemand not found');
    }
  }

  async update(id: number, updateCareDemandDto: UpdateCareDemandDto) {
    // const careDemand = await this.findOne(id);

    // const { title, careDemand: newCareDemand } = updateCareDemandDto;

    // if (title) careDemand.title = title;

    // if (newCareDemand) careDemand.careDemand = newCareDemand;
    // try {
    //   return await this.careDemandRepository.save(careDemand);
    // } catch (e) {
    //   throw new HttpException(e, 500);
    // }

    const careDemand = await this.careDemandRepository.findOne({
      where: { id },
      relations: ['careDemand'],
    });

    if (!careDemand) throw new NotFoundException();

    const { title, careDemand: newCareDemandEntries } = updateCareDemandDto;

    if (title) careDemand.title = title;

    if (!newCareDemandEntries)
      return this.careDemandRepository.save(careDemand);

    const oldCareDemandEntries = careDemand.careDemand;

    careDemand.careDemand = [];

    for (const newEntry of newCareDemandEntries) {
      const newCareDemandEntry = new CareDemandEntry();
      newCareDemandEntry.zipcode = newEntry.zipcode;
      newCareDemandEntry.clients = newEntry.clients ?? 0;
      newCareDemandEntry.hours = newEntry.hours ?? 0;
      careDemand.careDemand.push(newCareDemandEntry);
    }

    try {
      await this.removeCareDemandEntries(oldCareDemandEntries);
    } catch (error) {
      throw new HttpException(error, 500);
    }

    return this.careDemandRepository.save(careDemand);
  }

  async removeCareDemandEntries(entries: CareDemandEntry[]) {
    entries.forEach(async (entry) => {
      await this.careDemandEntryRepository.remove(entry);
    });
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
