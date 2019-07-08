import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovePendingAvatarComponent } from './approve-pending-avatar.component';

describe('ApprovePendingAvatarComponent', () => {
  let component: ApprovePendingAvatarComponent;
  let fixture: ComponentFixture<ApprovePendingAvatarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovePendingAvatarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovePendingAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
