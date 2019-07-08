import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMemberInfoComponent } from './update-member-info.component';

describe('UpdateMemberInfoComponent', () => {
  let component: UpdateMemberInfoComponent;
  let fixture: ComponentFixture<UpdateMemberInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateMemberInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateMemberInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
