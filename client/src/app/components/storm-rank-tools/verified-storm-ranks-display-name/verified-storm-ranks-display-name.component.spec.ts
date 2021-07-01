import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifiedStormRanksDisplayNameComponent } from './verified-storm-ranks-display-name.component';

describe('VerifiedStormRanksDisplayNameComponent', () => {
  let component: VerifiedStormRanksDisplayNameComponent;
  let fixture: ComponentFixture<VerifiedStormRanksDisplayNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifiedStormRanksDisplayNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifiedStormRanksDisplayNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
