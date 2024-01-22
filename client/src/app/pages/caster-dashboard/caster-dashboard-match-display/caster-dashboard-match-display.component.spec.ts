import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasterDashboardMatchDisplayComponent } from './caster-dashboard-match-display.component';

describe('CasterDashboardMatchDisplayComponent', () => {
  let component: CasterDashboardMatchDisplayComponent;
  let fixture: ComponentFixture<CasterDashboardMatchDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasterDashboardMatchDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasterDashboardMatchDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
