import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueStatsComponent } from './league-stats.component';

describe('LeagueStatsComponent', () => {
  let component: LeagueStatsComponent;
  let fixture: ComponentFixture<LeagueStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeagueStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
