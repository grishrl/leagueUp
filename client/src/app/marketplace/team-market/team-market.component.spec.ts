import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMarketComponent } from './team-market.component';

describe('TeamMarketComponent', () => {
  let component: TeamMarketComponent;
  let fixture: ComponentFixture<TeamMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
