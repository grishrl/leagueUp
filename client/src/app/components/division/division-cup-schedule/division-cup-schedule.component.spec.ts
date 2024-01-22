import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionCupScheduleComponent } from './division-cup-schedule.component';

describe('DivisionCupScheduleComponent', () => {
  let component: DivisionCupScheduleComponent;
  let fixture: ComponentFixture<DivisionCupScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionCupScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionCupScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
