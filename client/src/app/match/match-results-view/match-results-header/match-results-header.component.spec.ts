import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchResultsHeaderComponent } from './match-results-header.component';

describe('MatchResultsHeaderComponent', () => {
  let component: MatchResultsHeaderComponent;
  let fixture: ComponentFixture<MatchResultsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchResultsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchResultsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
