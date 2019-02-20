import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchSchedulerComponent } from './match-scheduler.component';

describe('MatchScheduleComponent', () => {
  let component: MatchSchedulerComponent;
  let fixture: ComponentFixture<MatchSchedulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchSchedulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
