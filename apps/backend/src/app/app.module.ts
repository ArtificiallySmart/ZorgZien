import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from './projects/entities/project.entity';
import { CareDemandModule } from './care-demand/care-demand.module';
import { CareDemandList } from './care-demand/entities/care-demand-list.entity';
import { CareSupplyModule } from './care-supply/care-supply.module';
import { CareSupplyEntry } from './care-supply/entities/care-supply-entry.entity';
import { CareSupplyList } from './care-supply/entities/care-supply-list.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UserEntity } from './users/models/user.entity';
import { TokenBlacklistEntity } from './auth/models/token-blacklist.entity';
import { CareDemandEntry } from './care-demand/entities/care-demand-entry.entity';
import { UserWhitelistEntity } from './users/models/user-whitelist.entity';

@Module({
  imports: [
    ProjectsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        Project,
        CareDemandList,
        CareDemandEntry,
        CareSupplyEntry,
        CareSupplyList,
        UserEntity,
        TokenBlacklistEntity,
        UserWhitelistEntity,
      ],
      synchronize: true,
    }),
    CareDemandModule,
    CareSupplyModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
