import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasterPageComponent } from './caster-page.component';

describe('CasterPageComponent', () => {
  let component: CasterPageComponent;
  let fixture: ComponentFixture<CasterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
