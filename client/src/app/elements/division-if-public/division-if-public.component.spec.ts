import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionIfPublicComponent } from './division-if-public.component';

describe('DivisionIfPublicComponent', () => {
  let component: DivisionIfPublicComponent;
  let fixture: ComponentFixture<DivisionIfPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionIfPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionIfPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
