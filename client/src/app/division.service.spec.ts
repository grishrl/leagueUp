import { TestBed } from '@angular/core/testing';

import { DivisionService } from './division.service';

describe('DivisionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DivisionService = TestBed.get(DivisionService);
    expect(service).toBeTruthy();
  });
});
