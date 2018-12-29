import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAclManagementComponent } from './admin-acl-management.component';

describe('AdminAclManagementComponent', () => {
  let component: AdminAclManagementComponent;
  let fixture: ComponentFixture<AdminAclManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAclManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAclManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
