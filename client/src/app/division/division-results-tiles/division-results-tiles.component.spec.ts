import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionResultsTilesComponent } from './division-results-tiles.component';

describe('DivisionResultsTilesComponent', () => {
  let component: DivisionResultsTilesComponent;
  let fixture: ComponentFixture<DivisionResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
