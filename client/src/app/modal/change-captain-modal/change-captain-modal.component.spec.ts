import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCaptainModalComponent } from './change-captain-modal.component';

describe('ChangeCaptainModalComponent', () => {
  let component: ChangeCaptainModalComponent;
  let fixture: ComponentFixture<ChangeCaptainModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeCaptainModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeCaptainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
