import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionTableViewComponent } from './division-table-view.component';

describe('DivisionTableViewComponent', () => {
  let component: DivisionTableViewComponent;
  let fixture: ComponentFixture<DivisionTableViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionTableViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
