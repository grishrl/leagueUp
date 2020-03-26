import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamNameComponent } from './team-name.component';

describe('TeamNameComponent', () => {
  let component: TeamNameComponent;
  let fixture: ComponentFixture<TeamNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
