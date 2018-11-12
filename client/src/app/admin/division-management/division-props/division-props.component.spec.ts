import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionPropsComponent } from './division-props.component';

describe('DivisionPropsComponent', () => {
  let component: DivisionPropsComponent;
  let fixture: ComponentFixture<DivisionPropsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionPropsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionPropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
