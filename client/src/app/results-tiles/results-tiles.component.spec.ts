import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTilesComponent } from './results-tiles.component';

describe('ResultsTilesComponent', () => {
  let component: ResultsTilesComponent;
  let fixture: ComponentFixture<ResultsTilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsTilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsTilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
