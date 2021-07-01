import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchupInfoEmbeddableComponent } from './matchup-info-embeddable.component';

describe('MatchupInfoEmbeddableComponent', () => {
  let component: MatchupInfoEmbeddableComponent;
  let fixture: ComponentFixture<MatchupInfoEmbeddableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchupInfoEmbeddableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchupInfoEmbeddableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
