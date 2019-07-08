import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionUpcomingMatchesComponent } from './division-upcoming-matches.component';

describe('DivisionUpcomingMatchesComponent', () => {
  let component: DivisionUpcomingMatchesComponent;
  let fixture: ComponentFixture<DivisionUpcomingMatchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionUpcomingMatchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionUpcomingMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
