import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateNonSeasonalSchedulesComponent } from './generate-non-seasonal-schedules.component';

describe('GenerateNonSeasonalSchedulesComponent', () => {
  let component: GenerateNonSeasonalSchedulesComponent;
  let fixture: ComponentFixture<GenerateNonSeasonalSchedulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateNonSeasonalSchedulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateNonSeasonalSchedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
