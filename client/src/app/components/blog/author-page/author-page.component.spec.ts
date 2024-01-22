import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorPageComponent } from './author-page.component';

describe('AuthorPageComponent', () => {
  let component: AuthorPageComponent;
  let fixture: ComponentFixture<AuthorPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
