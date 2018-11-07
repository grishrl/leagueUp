import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuickViewComponent } from './user-quick-view.component';

describe('UserQuickViewComponent', () => {
  let component: UserQuickViewComponent;
  let fixture: ComponentFixture<UserQuickViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuickViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuickViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
