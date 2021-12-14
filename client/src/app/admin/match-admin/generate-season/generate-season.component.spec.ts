import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSeasonComponent } from './generate-season.component';

describe('GenerateSeasonComponent', () => {
  let component: GenerateSeasonComponent;
  let fixture: ComponentFixture<GenerateSeasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateSeasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
