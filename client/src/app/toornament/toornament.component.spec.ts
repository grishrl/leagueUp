import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToornamentComponent } from './toornament.component';

describe('ToornamentComponent', () => {
  let component: ToornamentComponent;
  let fixture: ComponentFixture<ToornamentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToornamentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToornamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
