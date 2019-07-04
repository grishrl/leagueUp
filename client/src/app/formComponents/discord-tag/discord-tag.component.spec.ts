import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordTagComponent } from './discord-tag.component';

describe('DiscordTagComponent', () => {
  let component: DiscordTagComponent;
  let fixture: ComponentFixture<DiscordTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscordTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscordTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
