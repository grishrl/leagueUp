import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeCarouselComponent } from './large-carousel.component';

describe('LargeCarouselComponent', () => {
  let component: LargeCarouselComponent;
  let fixture: ComponentFixture<LargeCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
