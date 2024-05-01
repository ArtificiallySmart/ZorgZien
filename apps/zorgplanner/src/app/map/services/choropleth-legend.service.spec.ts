import { TestBed } from '@angular/core/testing';
import { ChoroplethLegendService } from './choropleth-legend.service';

describe('ChoroplethLegendService', () => {
  let service: ChoroplethLegendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChoroplethLegendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
