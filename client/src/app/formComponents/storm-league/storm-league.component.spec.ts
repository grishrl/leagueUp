import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StormLeagueComponent } from './storm-league.component';

describe('StormLeagueComponent', () => {
  let component: StormLeagueComponent;
  let fixture: ComponentFixture<StormLeagueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StormLeagueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StormLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
