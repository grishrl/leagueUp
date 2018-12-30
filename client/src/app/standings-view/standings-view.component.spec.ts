import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsViewComponent } from './standings-view.component';

describe('StandingsViewComponent', () => {
  let component: StandingsViewComponent;
  let fixture: ComponentFixture<StandingsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StandingsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandingsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
