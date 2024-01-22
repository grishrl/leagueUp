import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRankViewComponent } from './approve-rank-view.component';

describe('ApproveRankViewComponent', () => {
  let component: ApproveRankViewComponent;
  let fixture: ComponentFixture<ApproveRankViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveRankViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRankViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
