import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTeamViewComponent } from './mini-team-view.component';

describe('MiniTeamViewComponent', () => {
  let component: MiniTeamViewComponent;
  let fixture: ComponentFixture<MiniTeamViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniTeamViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniTeamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
