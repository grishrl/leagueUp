import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastTournamentViewerComponent } from './past-tournament-viewer.component';

describe('PastTournamentViewerComponent', () => {
  let component: PastTournamentViewerComponent;
  let fixture: ComponentFixture<PastTournamentViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastTournamentViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastTournamentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
