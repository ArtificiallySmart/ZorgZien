import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCareDemandComponent } from './edit-care-demand.component';

describe('EditCareDemandComponent', () => {
  let component: EditCareDemandComponent;
  let fixture: ComponentFixture<EditCareDemandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCareDemandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCareDemandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
