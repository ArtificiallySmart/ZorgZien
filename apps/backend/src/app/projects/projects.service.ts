import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
// import { UpdateProjectDto } from './dto/update-project.dto';
import { postgresDataSource } from '../../../db/data-source';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  projectRepository = postgresDataSource.getRepository(Project);
  constructor() {}

  create(createProjectDto: CreateProjectDto) {
    return this.projectRepository.save(createProjectDto);
  }

  findAll(organisationId: string) {
    return this.projectRepository.find({
      relations: {
        organisations: true,
      },
      where: {
        organisations: {
          id: organisationId,
        },
      },
    });
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
