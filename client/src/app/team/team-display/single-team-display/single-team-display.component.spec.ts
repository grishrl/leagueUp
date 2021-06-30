import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleTeamDisplayComponent } from './single-team-display.component';

describe('SingleTeamDisplayComponent', () => {
  let component: SingleTeamDisplayComponent;
  let fixture: ComponentFixture<SingleTeamDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleTeamDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleTeamDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
