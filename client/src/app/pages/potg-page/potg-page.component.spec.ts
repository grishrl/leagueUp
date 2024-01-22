import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PotgPageComponent } from './potg-page.component';

describe('PotgPageComponent', () => {
  let component: PotgPageComponent;
  let fixture: ComponentFixture<PotgPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PotgPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PotgPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
