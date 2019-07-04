import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamResultsTilesComponent } from './team-results-tiles.component';

describe('TeamResultsTilesComponent', () => {
  let component: TeamResultsTilesComponent;
  let fixture: ComponentFixture<TeamResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
