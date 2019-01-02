import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTeamViewComponent } from './manage-team-view.component';

describe('ManageTeamViewComponent', () => {
  let component: ManageTeamViewComponent;
  let fixture: ComponentFixture<ManageTeamViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTeamViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTeamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
