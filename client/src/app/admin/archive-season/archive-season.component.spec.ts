import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveSeasonComponent } from './archive-season.component';

describe('ArchiveSeasonComponent', () => {
  let component: ArchiveSeasonComponent;
  let fixture: ComponentFixture<ArchiveSeasonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchiveSeasonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveSeasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
