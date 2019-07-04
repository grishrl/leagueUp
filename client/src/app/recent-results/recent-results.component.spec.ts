import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentResultsComponent } from './recent-results.component';

describe('RecentResultsComponent', () => {
  let component: RecentResultsComponent;
  let fixture: ComponentFixture<RecentResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecentResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
