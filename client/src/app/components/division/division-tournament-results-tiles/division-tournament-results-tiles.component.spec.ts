import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionTournamentResultsTilesComponent } from './division-tournament-results-tiles.component';

describe('DivisionTournamentResultsTilesComponent', () => {
  let component: DivisionTournamentResultsTilesComponent;
  let fixture: ComponentFixture<DivisionTournamentResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionTournamentResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionTournamentResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
