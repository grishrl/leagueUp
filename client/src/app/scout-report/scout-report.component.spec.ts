import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutReportComponent } from './scout-report.component';

describe('ScoutReportComponent', () => {
  let component: ScoutReportComponent;
  let fixture: ComponentFixture<ScoutReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoutReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
