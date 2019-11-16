import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorNameComponent } from './author-name.component';

describe('AuthorNameComponent', () => {
  let component: AuthorNameComponent;
  let fixture: ComponentFixture<AuthorNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
