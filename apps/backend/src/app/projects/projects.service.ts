import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
// import { UpdateProjectDto } from './dto/update-project.dto';
import { DataSource } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  projectRepository = this.dataSource.getRepository(Project);
  constructor(private dataSource: DataSource) {}

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

  // update(id: number, updateProjectDto: UpdateProjectDto) {
  //   return `This action updates a #${id} project`;
  // }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
