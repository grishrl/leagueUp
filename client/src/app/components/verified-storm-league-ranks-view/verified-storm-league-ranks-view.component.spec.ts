import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedStormLeagueRanksViewComponent } from './verified-storm-league-ranks-view.component';

describe('VerifiedStormLeagueRanksViewComponent', () => {
  let component: VerifiedStormLeagueRanksViewComponent;
  let fixture: ComponentFixture<VerifiedStormLeagueRanksViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifiedStormLeagueRanksViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifiedStormLeagueRanksViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
