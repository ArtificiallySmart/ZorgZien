import { TestBed } from '@angular/core/testing';

import { CareDemandService } from './care-demand.service';

describe('CareDemandService', () => {
  let service: CareDemandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CareDemandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
