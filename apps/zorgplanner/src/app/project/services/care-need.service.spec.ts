import { TestBed } from '@angular/core/testing';

import { CareNeedService } from './care-need.service';

describe('CareNeedService', () => {
  let service: CareNeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CareNeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
