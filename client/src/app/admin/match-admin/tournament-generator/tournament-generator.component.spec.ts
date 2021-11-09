import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentGeneratorComponent } from './tournament-generator.component';

describe('TournamentGeneratorComponent', () => {
  let component: TournamentGeneratorComponent;
  let fixture: ComponentFixture<TournamentGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
