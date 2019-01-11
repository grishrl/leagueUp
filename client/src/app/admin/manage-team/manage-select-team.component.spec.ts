import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSelectComponent } from './manage-select-team.component';

describe('ManageSelectComponent', () => {
  let component: ManageSelectComponent;
  let fixture: ComponentFixture<ManageSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
