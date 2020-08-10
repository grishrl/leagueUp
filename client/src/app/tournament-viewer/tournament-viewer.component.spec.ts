import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentViewerComponent } from './tournament-viewer.component';

describe('TournamentViewerComponent', () => {
  let component: TournamentViewerComponent;
  let fixture: ComponentFixture<TournamentViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
