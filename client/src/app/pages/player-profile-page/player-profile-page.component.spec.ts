import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerProfile } from './player-profile-page.component';

describe('PlayerProfile', () => {
  let component: PlayerProfile;
  let fixture: ComponentFixture<PlayerProfile>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerProfile ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
