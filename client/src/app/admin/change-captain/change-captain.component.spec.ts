import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCaptainComponent } from './change-captain.component';

describe('ChangeCaptainComponent', () => {
  let component: ChangeCaptainComponent;
  let fixture: ComponentFixture<ChangeCaptainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeCaptainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeCaptainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
