import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveMemberViewComponent } from './approve-member-view.component';

describe('ApproveMemberViewComponent', () => {
  let component: ApproveMemberViewComponent;
  let fixture: ComponentFixture<ApproveMemberViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveMemberViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveMemberViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
