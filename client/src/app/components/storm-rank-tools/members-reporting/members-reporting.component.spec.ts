import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersReportingComponent } from './members-reporting.component';

describe('MembersReportingComponent', () => {
  let component: MembersReportingComponent;
  let fixture: ComponentFixture<MembersReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembersReportingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
