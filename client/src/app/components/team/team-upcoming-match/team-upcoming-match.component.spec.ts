import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamUpcomingMatchComponent } from './team-upcoming-match.component';

describe('TeamUpcomingMatchComponent', () => {
  let component: TeamUpcomingMatchComponent;
  let fixture: ComponentFixture<TeamUpcomingMatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamUpcomingMatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamUpcomingMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
