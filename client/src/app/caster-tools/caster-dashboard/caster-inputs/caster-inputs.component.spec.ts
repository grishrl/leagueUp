import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasterInputsComponent } from './caster-inputs.component';

describe('CasterInputsComponent', () => {
  let component: CasterInputsComponent;
  let fixture: ComponentFixture<CasterInputsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasterInputsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasterInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
