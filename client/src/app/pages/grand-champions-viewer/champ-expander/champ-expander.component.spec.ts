import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampExpanderComponent } from './champ-expander.component';

describe('ChampExpanderComponent', () => {
  let component: ChampExpanderComponent;
  let fixture: ComponentFixture<ChampExpanderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChampExpanderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChampExpanderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
