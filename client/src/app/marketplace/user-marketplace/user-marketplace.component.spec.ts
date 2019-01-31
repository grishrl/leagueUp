import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMarketplaceComponent } from './user-marketplace.component';

describe('UserMarketplaceComponent', () => {
  let component: UserMarketplaceComponent;
  let fixture: ComponentFixture<UserMarketplaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMarketplaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
