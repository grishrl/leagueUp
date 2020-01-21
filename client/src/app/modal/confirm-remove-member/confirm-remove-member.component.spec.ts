import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmRemoveMemberComponent } from './confirm-remove-member.component';

describe('ConfirmRemoveMemberComponent', () => {
  let component: ConfirmRemoveMemberComponent;
  let fixture: ComponentFixture<ConfirmRemoveMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmRemoveMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRemoveMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
