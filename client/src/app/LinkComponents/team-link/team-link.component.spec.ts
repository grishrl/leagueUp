import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLinkComponent } from './team-link.component';

describe('TeamLinkComponent', () => {
  let component: TeamLinkComponent;
  let fixture: ComponentFixture<TeamLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
