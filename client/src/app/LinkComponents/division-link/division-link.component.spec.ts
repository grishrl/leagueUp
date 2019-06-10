import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionLinkComponent } from './division-link.component';

describe('DivisionLinkComponent', () => {
  let component: DivisionLinkComponent;
  let fixture: ComponentFixture<DivisionLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
