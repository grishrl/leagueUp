import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralImageUploadComponent } from './general-image-upload.component';

describe('GeneralImageUploadComponent', () => {
  let component: GeneralImageUploadComponent;
  let fixture: ComponentFixture<GeneralImageUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralImageUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
