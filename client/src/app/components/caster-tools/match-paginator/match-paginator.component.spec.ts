import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchPaginatorComponent } from './match-paginator.component';

describe('MatchPaginatorComponent', () => {
  let component: MatchPaginatorComponent;
  let fixture: ComponentFixture<MatchPaginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchPaginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
