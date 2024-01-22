import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTournamentScheduleTableComponent } from './team-tournament-schedule-table.component';

describe('TeamTournamentScheduleTableComponent', () => {
  let component: TeamTournamentScheduleTableComponent;
  let fixture: ComponentFixture<TeamTournamentScheduleTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTournamentScheduleTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTournamentScheduleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
