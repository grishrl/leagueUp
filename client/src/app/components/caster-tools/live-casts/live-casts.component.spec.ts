import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveCastsComponent } from './live-casts.component';

describe('LiveCastsComponent', () => {
  let component: LiveCastsComponent;
  let fixture: ComponentFixture<LiveCastsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveCastsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveCastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
