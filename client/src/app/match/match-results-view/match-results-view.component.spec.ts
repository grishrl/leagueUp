import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchResultsViewComponent } from './match-results-view.component';

describe('MatchResultsViewComponent', () => {
  let component: MatchResultsViewComponent;
  let fixture: ComponentFixture<MatchResultsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchResultsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchResultsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
