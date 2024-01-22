import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastSeasonsComponent } from './past-seasons.component';

describe('PastSeasonsComponent', () => {
  let component: PastSeasonsComponent;
  let fixture: ComponentFixture<PastSeasonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastSeasonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastSeasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
