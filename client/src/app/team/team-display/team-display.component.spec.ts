import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDisplayComponent } from './team-display.component';

describe('TeamDisplayComponent', () => {
  let component: TeamDisplayComponent;
  let fixture: ComponentFixture<TeamDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
