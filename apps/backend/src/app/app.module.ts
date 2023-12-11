import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from './projects/entities/project.entity';
import { CareDemandModule } from './care-demand/care-demand.module';
import { CareDemand } from './care-demand/entities/care-demand.entity';
import { CareSupplyModule } from './care-supply/care-supply.module';
import { CareSupplyEntry } from './care-supply/entities/care-supply-entry.entity';
import { CareSupplyList } from './care-supply/entities/care-supply-list.entity';

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
      entities: [Project, CareDemand, CareSupplyEntry, CareSupplyList],
      synchronize: true,
    }),
    CareDemandModule,
    CareSupplyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
