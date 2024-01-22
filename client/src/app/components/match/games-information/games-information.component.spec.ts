import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesInformationComponent } from './games-information.component';

describe('GamesInformationComponent', () => {
  let component: GamesInformationComponent;
  let fixture: ComponentFixture<GamesInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamesInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
