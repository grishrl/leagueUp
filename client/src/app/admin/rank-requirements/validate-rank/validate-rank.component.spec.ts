import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateRankComponent } from './validate-rank.component';

describe('ValidateRankComponent', () => {
  let component: ValidateRankComponent;
  let fixture: ComponentFixture<ValidateRankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateRankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateRankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
