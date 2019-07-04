import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownTimeComponent } from './drop-down-time.component';

describe('DropDownTimeComponent', () => {
  let component: DropDownTimeComponent;
  let fixture: ComponentFixture<DropDownTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropDownTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropDownTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
