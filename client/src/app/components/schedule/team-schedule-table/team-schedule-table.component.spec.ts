import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamScheduleTableComponent } from './team-schedule-table.component';

describe('TeamScheduleTableComponent', () => {
  let component: TeamScheduleTableComponent;
  let fixture: ComponentFixture<TeamScheduleTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamScheduleTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamScheduleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
