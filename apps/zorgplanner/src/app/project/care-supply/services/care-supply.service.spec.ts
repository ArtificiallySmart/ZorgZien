import { TestBed } from '@angular/core/testing';

import { CareSupplyService } from './care-supply.service';
import { DataService } from '../../services/data.service';
import { ProjectService } from '../../services/project.service';
import { ToastService } from '../../../shared/services/toast.service';

const mockDataService = {
  loadCareSupplyLists: jest.fn(),
  addCareSupplyList: jest.fn(),
  editCareSupplyList: jest.fn(),
  removeCareSupplyList: jest.fn(),
};

describe('CareSupplyService', () => {
  let service: CareSupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CareSupplyService,
        { provide: DataService, useValue: mockDataService },
        { provide: ProjectService, useValue: {} },
        { provide: ToastService, useValue: {} },
      ],
    });
    service = TestBed.inject(CareSupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call loadCareSupplyLists on init', () => {
    expect(mockDataService.loadCareSupplyLists).toHaveBeenCalled();
  });
});
