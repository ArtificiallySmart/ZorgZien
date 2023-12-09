import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from './projects/entities/project.entity';
import { CareNeedModule } from './care-need/care-need.module';
import { CareNeed } from './care-need/entities/care-need.entity';

@Module({
  imports: [
    ProjectsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      entities: [Project, CareNeed],
      synchronize: true,
    }),
    CareNeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
