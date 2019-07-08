import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMemberComponent } from './manage-member.component';

describe('ManageMemberComponent', () => {
  let component: ManageMemberComponent;
  let fixture: ComponentFixture<ManageMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
