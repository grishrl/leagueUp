import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SheduleViewComponent } from './shedule-view.component';

describe('SheduleViewComponent', () => {
  let component: SheduleViewComponent;
  let fixture: ComponentFixture<SheduleViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SheduleViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SheduleViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
