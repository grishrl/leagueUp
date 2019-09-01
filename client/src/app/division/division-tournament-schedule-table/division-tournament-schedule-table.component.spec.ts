import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionTournamentScheduleTableComponent } from './division-tournament-schedule-table.component';

describe('DivisionTournamentScheduleTableComponent', () => {
  let component: DivisionTournamentScheduleTableComponent;
  let fixture: ComponentFixture<DivisionTournamentScheduleTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionTournamentScheduleTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionTournamentScheduleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
