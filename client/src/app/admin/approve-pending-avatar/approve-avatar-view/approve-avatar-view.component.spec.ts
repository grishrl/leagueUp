import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveAvatarViewComponent } from './approve-avatar-view.component';

describe('ApproveAvatarViewComponent', () => {
  let component: ApproveAvatarViewComponent;
  let fixture: ComponentFixture<ApproveAvatarViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveAvatarViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveAvatarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
