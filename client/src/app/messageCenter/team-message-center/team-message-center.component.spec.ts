import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMessageCenterComponent } from './team-message-center.component';

describe('TeamMessageCenterComponent', () => {
  let component: TeamMessageCenterComponent;
  let fixture: ComponentFixture<TeamMessageCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamMessageCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMessageCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
