import { TestBed } from '@angular/core/testing';

import { ZipcodeDataService } from './zipcode-data.service';

describe('ZipcodeDataService', () => {
  let service: ZipcodeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZipcodeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
