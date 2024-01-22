import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PotgDisplayComponent } from './potg-display.component';

describe('PotgDisplayComponent', () => {
  let component: PotgDisplayComponent;
  let fixture: ComponentFixture<PotgDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PotgDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PotgDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
