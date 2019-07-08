import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerLinkComponent } from './player-link.component';

describe('PlayerLinkComponent', () => {
  let component: PlayerLinkComponent;
  let fixture: ComponentFixture<PlayerLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
