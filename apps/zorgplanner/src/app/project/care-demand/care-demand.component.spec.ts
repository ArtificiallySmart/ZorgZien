import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CareDemandComponent } from './care-demand.component';

describe('CareDemandComponent', () => {
  let component: CareDemandComponent;
  let fixture: ComponentFixture<CareDemandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareDemandComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CareDemandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
