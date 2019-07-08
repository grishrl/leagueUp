import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonInfoManagerComponent } from './season-info-manager.component';

describe('SeasonInfoManagerComponent', () => {
  let component: SeasonInfoManagerComponent;
  let fixture: ComponentFixture<SeasonInfoManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonInfoManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonInfoManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
