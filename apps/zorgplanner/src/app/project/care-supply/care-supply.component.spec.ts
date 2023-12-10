import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CareSupplyComponent } from './care-supply.component';

describe('CareSupplyComponent', () => {
  let component: CareSupplyComponent;
  let fixture: ComponentFixture<CareSupplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CareSupplyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CareSupplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
