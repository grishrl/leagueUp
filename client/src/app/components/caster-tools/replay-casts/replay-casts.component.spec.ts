import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayCastsComponent } from './replay-casts.component';

describe('ReplayCastsComponent', () => {
  let component: ReplayCastsComponent;
  let fixture: ComponentFixture<ReplayCastsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplayCastsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplayCastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
