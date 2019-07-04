import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTickerComponent } from './team-ticker.component';

describe('TeamTickerComponent', () => {
  let component: TeamTickerComponent;
  let fixture: ComponentFixture<TeamTickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
