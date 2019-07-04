import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantCaptainMgmtComponent } from './assistant-captain-mgmt.component';

describe('AssistantCaptainMgmtComponent', () => {
  let component: AssistantCaptainMgmtComponent;
  let fixture: ComponentFixture<AssistantCaptainMgmtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssistantCaptainMgmtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssistantCaptainMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
