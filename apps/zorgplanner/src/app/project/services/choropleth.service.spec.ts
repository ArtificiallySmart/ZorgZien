import { TestBed } from '@angular/core/testing';

import { ChoroplethService } from './choropleth.service';

describe('choroplethService', () => {
  let service: ChoroplethService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChoroplethService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});