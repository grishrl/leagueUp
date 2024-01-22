import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentlyLiveGamesComponent } from './currently-live-games.component';

describe('CurrentlyLiveGamesComponent', () => {
  let component: CurrentlyLiveGamesComponent;
  let fixture: ComponentFixture<CurrentlyLiveGamesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentlyLiveGamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentlyLiveGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
