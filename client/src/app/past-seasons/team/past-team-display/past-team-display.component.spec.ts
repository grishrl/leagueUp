import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastTeamDisplayComponent } from './past-team-display.component';

describe('TeamDisplayComponent', () => {
  let component: PastTeamDisplayComponent;
  let fixture: ComponentFixture<PastTeamDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastTeamDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastTeamDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
