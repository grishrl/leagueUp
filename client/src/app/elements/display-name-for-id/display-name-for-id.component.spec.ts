import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayNameForIdComponent } from './display-name-for-id.component';

describe('DisplayNameForIdComponent', () => {
  let component: DisplayNameForIdComponent;
  let fixture: ComponentFixture<DisplayNameForIdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayNameForIdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayNameForIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
