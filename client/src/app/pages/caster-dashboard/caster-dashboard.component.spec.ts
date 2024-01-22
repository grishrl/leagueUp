import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasterDashboardComponent } from './caster-dashboard.component';

describe('CasterDashboardComponent', () => {
  let component: CasterDashboardComponent;
  let fixture: ComponentFixture<CasterDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasterDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
