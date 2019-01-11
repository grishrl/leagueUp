import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetDeadlineComponent } from './set-deadline.component';

describe('SetDeadlineComponent', () => {
  let component: SetDeadlineComponent;
  let fixture: ComponentFixture<SetDeadlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetDeadlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetDeadlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
