import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersDisplayComponent } from './members-display.component';

describe('MembersDisplayComponent', () => {
  let component: MembersDisplayComponent;
  let fixture: ComponentFixture<MembersDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
