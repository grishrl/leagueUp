import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminYoutubeCurator } from './admin-youtube-curator.component';

describe('AdminYoutubeCurator', () => {
  let component: AdminYoutubeCurator;
  let fixture: ComponentFixture<AdminYoutubeCurator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminYoutubeCurator ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminYoutubeCurator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
