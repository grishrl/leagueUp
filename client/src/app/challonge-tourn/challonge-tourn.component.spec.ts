import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallongeTournComponent } from './challonge-tourn.component';

describe('ChallongeTournComponent', () => {
  let component: ChallongeTournComponent;
  let fixture: ComponentFixture<ChallongeTournComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChallongeTournComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallongeTournComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
