import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopStatsWidgetComponent } from './top-stats-widget.component';

describe('TopStatsWidgetComponent', () => {
  let component: TopStatsWidgetComponent;
  let fixture: ComponentFixture<TopStatsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopStatsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopStatsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
