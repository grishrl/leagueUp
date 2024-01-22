import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamManagerComponent } from './stream-manager.component';

describe('StreamManagerComponent', () => {
  let component: StreamManagerComponent;
  let fixture: ComponentFixture<StreamManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreamManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
