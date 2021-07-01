import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamHistoryComponent } from './team-history.component';

describe('TeamHistoryComponent', () => {
  let component: TeamHistoryComponent;
  let fixture: ComponentFixture<TeamHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
