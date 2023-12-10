import { Test, TestingModule } from '@nestjs/testing';
import { CareDemandService } from './care-demand.service';

describe('CareDemandService', () => {
  let service: CareDemandService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareDemandService],
    }).compile();

    service = module.get<CareDemandService>(CareDemandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
