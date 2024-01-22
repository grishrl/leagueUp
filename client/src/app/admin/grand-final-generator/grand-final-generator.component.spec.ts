import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrandFinalGeneratorComponent } from './grand-final-generator.component';

describe('GrandFinalGeneratorComponent', () => {
  let component: GrandFinalGeneratorComponent;
  let fixture: ComponentFixture<GrandFinalGeneratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrandFinalGeneratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrandFinalGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
