import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasterReportComponent } from './caster-report.component';

describe('CasterReportComponent', () => {
  let component: CasterReportComponent;
  let fixture: ComponentFixture<CasterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
