import { Test, TestingModule } from '@nestjs/testing';
import { CareDemandController } from './care-demand.controller';
import { CareDemandService } from './care-demand.service';

describe('CareDemandController', () => {
  let controller: CareDemandController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareDemandController],
      providers: [CareDemandService],
    }).compile();

    controller = module.get<CareDemandController>(CareDemandController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
