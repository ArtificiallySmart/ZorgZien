import { Module } from '@nestjs/common';
import { CareNeedService } from './care-need.service';
import { CareNeedController } from './care-need.controller';

@Module({
  controllers: [CareNeedController],
  providers: [CareNeedService],
})
export class CareNeedModule {}
