import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplayFilesLinkComponent } from './replay-files-link.component';

describe('ReplayFilesLinkComponent', () => {
  let component: ReplayFilesLinkComponent;
  let fixture: ComponentFixture<ReplayFilesLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplayFilesLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplayFilesLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
