import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesAvailableComponent } from './times-available.component';

describe('TimesAvailableComponent', () => {
  let component: TimesAvailableComponent;
  let fixture: ComponentFixture<TimesAvailableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesAvailableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
