import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { dataSourceOptions } from '../../db/data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CareDemandModule } from './care-demand/care-demand.module';
import { CareSupplyModule } from './care-supply/care-supply.module';
import { EmailModule } from './email/email.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ProjectsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    CareDemandModule,
    CareSupplyModule,
    AuthModule,
    UsersModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
