import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutreachEmailResponseComponent } from './outreach-email-response.component';

describe('OutreachEmailResponseComponent', () => {
  let component: OutreachEmailResponseComponent;
  let fixture: ComponentFixture<OutreachEmailResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutreachEmailResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutreachEmailResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
