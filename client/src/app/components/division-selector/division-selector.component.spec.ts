import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionSelectorComponent } from './division-selector.component';

describe('DivisionSelectorComponent', () => {
  let component: DivisionSelectorComponent;
  let fixture: ComponentFixture<DivisionSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
