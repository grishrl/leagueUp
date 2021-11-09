import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTournamentComponent } from './delete-tournament.component';

describe('DeleteTournamentComponent', () => {
  let component: DeleteTournamentComponent;
  let fixture: ComponentFixture<DeleteTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteTournamentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
