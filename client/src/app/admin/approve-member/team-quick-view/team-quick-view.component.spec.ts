import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamQuickViewComponent } from './team-quick-view.component';

describe('TeamQuickViewComponent', () => {
  let component: TeamQuickViewComponent;
  let fixture: ComponentFixture<TeamQuickViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamQuickViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamQuickViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
