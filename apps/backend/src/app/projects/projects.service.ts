import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { DataSource } from 'typeorm';
import { Project } from './entities/project.entity';
import { Organisation } from '../organisation/entities/organisation.entity';
import { from, map } from 'rxjs';

@Injectable()
export class ProjectsService {
  constructor(private dataSource: DataSource) {}
  projectRepository = this.dataSource.getRepository(Project);
  create(createProjectDto: CreateProjectDto, organisation: Organisation) {
    const project = this.projectRepository.create(createProjectDto);
    project.organisations = [organisation];
    console.log('project', project);
    return this.projectRepository.save(project);
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

  findOne(id: number, organisationId: string) {
    return from(
      this.projectRepository.findOne({
        relations: {
          organisations: true,
        },
        where: {
          id: id,
        },
      })
    ).pipe(
      map((project) => {
        if (
          project.organisations.find((o) => o.id === organisationId) ===
          undefined
        ) {
          throw new UnauthorizedException(
            'You are not authorized to access this project.'
          );
        }
        return project;
      })
    );
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
