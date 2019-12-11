import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchupHistoryComponent } from './matchup-history.component';

describe('MatchupHistoryComponent', () => {
  let component: MatchupHistoryComponent;
  let fixture: ComponentFixture<MatchupHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchupHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchupHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
