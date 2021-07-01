import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveGameEmbeddComponent } from './live-game-embedd.component';

describe('LiveGameEmbeddComponent', () => {
  let component: LiveGameEmbeddComponent;
  let fixture: ComponentFixture<LiveGameEmbeddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveGameEmbeddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveGameEmbeddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
