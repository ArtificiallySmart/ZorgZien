import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from '../users/entities/user.interface';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Req() req: Request, @Body() createProjectDto: CreateProjectDto) {
    const { user } = req.user as { user: User };
    const organisation = user.organisation;
    console.log('organisation', organisation);
    return this.projectsService.create(createProjectDto, organisation);
  }

  @Get()
  findAll(@Req() req: Request) {
    const { user } = req.user as { user: User };
    const organisation = user.organisation;
    return this.projectsService.findAll(organisation.id);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const { user } = req.user as { user: User };
    const organisation = user.organisation;
    return this.projectsService.findOne(+id, organisation.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
  //   return this.projectsService.update(+id, updateProjectDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
