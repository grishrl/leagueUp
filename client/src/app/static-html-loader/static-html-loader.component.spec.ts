import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticHtmlLoaderComponent } from './static-html-loader.component';

describe('StaticHtmlLoaderComponent', () => {
  let component: StaticHtmlLoaderComponent;
  let fixture: ComponentFixture<StaticHtmlLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticHtmlLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticHtmlLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
