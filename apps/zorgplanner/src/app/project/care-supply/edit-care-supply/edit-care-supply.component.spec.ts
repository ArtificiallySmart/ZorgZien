import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCareSupplyComponent } from './edit-care-supply.component';

describe('EditCareSupplyComponent', () => {
  let component: EditCareSupplyComponent;
  let fixture: ComponentFixture<EditCareSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCareSupplyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCareSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
