import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchViewModalComponent } from './match-view-modal.component';

describe('MatchViewModalComponent', () => {
  let component: MatchViewModalComponent;
  let fixture: ComponentFixture<MatchViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
