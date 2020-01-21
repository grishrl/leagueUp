import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCarouselComponent } from './mini-carousel.component';

describe('MiniCarouselComponent', () => {
  let component: MiniCarouselComponent;
  let fixture: ComponentFixture<MiniCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
