import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMessageCenterComponent } from './user-message-center.component';

describe('UserMessageCenterComponent', () => {
  let component: UserMessageCenterComponent;
  let fixture: ComponentFixture<UserMessageCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMessageCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMessageCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
