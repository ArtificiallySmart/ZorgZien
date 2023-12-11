import { Test, TestingModule } from '@nestjs/testing';
import { CareSupplyController } from './care-supply.controller';
import { CareSupplyService } from './care-supply.service';

describe('CareSupplyController', () => {
  let controller: CareSupplyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareSupplyController],
      providers: [CareSupplyService],
    }).compile();

    controller = module.get<CareSupplyController>(CareSupplyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
