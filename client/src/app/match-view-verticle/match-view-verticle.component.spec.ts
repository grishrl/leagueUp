import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchViewVerticleComponent } from './match-view-verticle.component';

describe('MatchViewVerticleComponent', () => {
  let component: MatchViewVerticleComponent;
  let fixture: ComponentFixture<MatchViewVerticleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchViewVerticleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchViewVerticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
