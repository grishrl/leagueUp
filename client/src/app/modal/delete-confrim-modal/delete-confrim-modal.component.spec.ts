import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConfrimModalComponent } from './delete-confrim-modal.component';

describe('DeleteConfrimModalComponent', () => {
  let component: DeleteConfrimModalComponent;
  let fixture: ComponentFixture<DeleteConfrimModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteConfrimModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteConfrimModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
