import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionCupResultsTilesComponent } from './division-cup-results-tiles.component';

describe('DivisionCupResultsTilesComponent', () => {
  let component: DivisionCupResultsTilesComponent;
  let fixture: ComponentFixture<DivisionCupResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionCupResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionCupResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
