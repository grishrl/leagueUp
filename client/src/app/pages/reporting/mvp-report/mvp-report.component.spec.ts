import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvpReportComponent } from './mvp-report.component';

describe('MvpReportComponent', () => {
  let component: MvpReportComponent;
  let fixture: ComponentFixture<MvpReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvpReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvpReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
