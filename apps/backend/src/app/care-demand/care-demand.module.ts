import { Module } from '@nestjs/common';
import { CareDemandService as CareDemandService } from './care-demand.service';
import { CareDemandController as CareDemandController } from './care-demand.controller';

@Module({
  controllers: [CareDemandController],
  providers: [CareDemandService],
})
export class CareDemandModule {}
