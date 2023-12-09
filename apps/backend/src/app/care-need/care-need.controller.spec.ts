import { Test, TestingModule } from '@nestjs/testing';
import { CareNeedController } from './care-need.controller';
import { CareNeedService } from './care-need.service';

describe('CareNeedController', () => {
  let controller: CareNeedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareNeedController],
      providers: [CareNeedService],
    }).compile();

    controller = module.get<CareNeedController>(CareNeedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
