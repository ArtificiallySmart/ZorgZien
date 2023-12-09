import { Test, TestingModule } from '@nestjs/testing';
import { CareNeedService } from './care-need.service';

describe('CareNeedService', () => {
  let service: CareNeedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareNeedService],
    }).compile();

    service = module.get<CareNeedService>(CareNeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
