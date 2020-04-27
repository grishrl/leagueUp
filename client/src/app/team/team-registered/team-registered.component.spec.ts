import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRegisteredComponent } from './team-registered.component';

describe('TeamRegisteredComponent', () => {
  let component: TeamRegisteredComponent;
  let fixture: ComponentFixture<TeamRegisteredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamRegisteredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
