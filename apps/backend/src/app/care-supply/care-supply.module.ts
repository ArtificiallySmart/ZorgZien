import { Module } from '@nestjs/common';
import { CareSupplyService } from './care-supply.service';
import { CareSupplyController } from './care-supply.controller';

@Module({
  controllers: [CareSupplyController],
  providers: [CareSupplyService],
})
export class CareSupplyModule {}
