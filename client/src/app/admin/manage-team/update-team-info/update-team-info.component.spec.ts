import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTeamInfoComponent } from './update-team-info.component';

describe('UpdateTeamInfoComponent', () => {
  let component: UpdateTeamInfoComponent;
  let fixture: ComponentFixture<UpdateTeamInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateTeamInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateTeamInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
