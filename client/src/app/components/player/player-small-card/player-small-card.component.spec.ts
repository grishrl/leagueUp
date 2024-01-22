import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSmallCardComponent } from './player-small-card.component';

describe('PlayerSmallCardComponent', () => {
  let component: PlayerSmallCardComponent;
  let fixture: ComponentFixture<PlayerSmallCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerSmallCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
