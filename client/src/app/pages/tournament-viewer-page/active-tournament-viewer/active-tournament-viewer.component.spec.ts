import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTournamentViewerComponent } from './active-tournament-viewer.component';

describe('ActiveTournamentViewerComponent', () => {
  let component: ActiveTournamentViewerComponent;
  let fixture: ComponentFixture<ActiveTournamentViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveTournamentViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveTournamentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
