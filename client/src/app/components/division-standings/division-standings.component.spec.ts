import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionStandingsComponent } from './division-standings.component';

describe('DivisionStandingsComponent', () => {
  let component: DivisionStandingsComponent;
  let fixture: ComponentFixture<DivisionStandingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionStandingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionStandingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
