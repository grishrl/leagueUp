import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLargeComponent } from './event-large.component';

describe('EventLargeComponent', () => {
  let component: EventLargeComponent;
  let fixture: ComponentFixture<EventLargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventLargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
