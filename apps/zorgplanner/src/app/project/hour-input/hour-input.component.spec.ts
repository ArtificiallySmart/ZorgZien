import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HourInputComponent } from './hour-input.component';

describe('HourInputComponent', () => {
  let component: HourInputComponent;
  let fixture: ComponentFixture<HourInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HourInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
