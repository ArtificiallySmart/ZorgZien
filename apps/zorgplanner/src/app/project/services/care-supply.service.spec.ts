import { TestBed } from '@angular/core/testing';

import { CareSupplyService } from './care-supply.service';

describe('CareSupplyService', () => {
  let service: CareSupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CareSupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
