import { Test, TestingModule } from '@nestjs/testing';
import { CareSupplyService } from './care-supply.service';

describe('CareSupplyService', () => {
  let service: CareSupplyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareSupplyService],
    }).compile();

    service = module.get<CareSupplyService>(CareSupplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
