import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgsAccordianComponent } from './ngs-accordian.component';

describe('NgsAccordianComponent', () => {
  let component: NgsAccordianComponent;
  let fixture: ComponentFixture<NgsAccordianComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgsAccordianComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgsAccordianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
