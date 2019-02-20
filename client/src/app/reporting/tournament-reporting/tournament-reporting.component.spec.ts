import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentReportingComponent } from './tournament-reporting.component';

describe('TournamentReportingComponent', () => {
  let component: TournamentReportingComponent;
  let fixture: ComponentFixture<TournamentReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentReportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
