import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { DataSource } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(private dataSource: DataSource) {}
  projectRepository = this.dataSource.getRepository(Project);

  create(createProjectDto: CreateProjectDto) {
    const project = this.projectRepository.create(createProjectDto);

    return this.projectRepository.save(project);
  }

  findAll() {
    return this.projectRepository.find();
  }

  findOne(id: number) {
    return this.projectRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
