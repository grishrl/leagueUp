import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundColumnComponent } from './round-column.component';

describe('RoundColumnComponent', () => {
  let component: RoundColumnComponent;
  let fixture: ComponentFixture<RoundColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
