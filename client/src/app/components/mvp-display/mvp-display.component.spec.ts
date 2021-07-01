import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvpDisplayComponent } from './mvp-display.component';

describe('MvpDisplayComponent', () => {
  let component: MvpDisplayComponent;
  let fixture: ComponentFixture<MvpDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvpDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvpDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
