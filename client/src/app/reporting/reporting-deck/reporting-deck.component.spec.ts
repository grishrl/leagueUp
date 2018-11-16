import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingDeckComponent } from './reporting-deck.component';

describe('ReportingDeckComponent', () => {
  let component: ReportingDeckComponent;
  let fixture: ComponentFixture<ReportingDeckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingDeckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
