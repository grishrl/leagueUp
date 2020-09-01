import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrandChampionsViewerComponent } from './grand-champions-viewer.component';

describe('GrandChampionsViewerComponent', () => {
  let component: GrandChampionsViewerComponent;
  let fixture: ComponentFixture<GrandChampionsViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrandChampionsViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrandChampionsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
