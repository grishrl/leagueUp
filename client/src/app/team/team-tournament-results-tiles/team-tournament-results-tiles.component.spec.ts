import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTournamentResultsTilesComponent } from './team-tournament-results-tiles.component';

describe('TeamTournamentResultsTilesComponent', () => {
  let component: TeamTournamentResultsTilesComponent;
  let fixture: ComponentFixture<TeamTournamentResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTournamentResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTournamentResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
