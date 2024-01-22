import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RankRequirementsComponent } from './rank-requirements.component';

describe('RankRequirementsComponent', () => {
  let component: RankRequirementsComponent;
  let fixture: ComponentFixture<RankRequirementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RankRequirementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RankRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
