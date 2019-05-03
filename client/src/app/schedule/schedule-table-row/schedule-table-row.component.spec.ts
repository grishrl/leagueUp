import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTableRowComponent } from './schedule-table-row.component';

describe('ScheduleTableRowComponent', () => {
  let component: ScheduleTableRowComponent;
  let fixture: ComponentFixture<ScheduleTableRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleTableRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleTableRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
