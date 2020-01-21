import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsNoSidebarComponent } from './news-no-sidebar.component';

describe('NewsNoSidebarComponent', () => {
  let component: NewsNoSidebarComponent;
  let fixture: ComponentFixture<NewsNoSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsNoSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsNoSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
