import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvpPageComponent } from './mvp-page.component';

describe('MvpPageComponent', () => {
  let component: MvpPageComponent;
  let fixture: ComponentFixture<MvpPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvpPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
