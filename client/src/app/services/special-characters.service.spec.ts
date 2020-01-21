import { TestBed } from '@angular/core/testing';

import { SpecialCharactersService } from './special-characters.service';

describe('SpecialCharactersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpecialCharactersService = TestBed.get(SpecialCharactersService);
    expect(service).toBeTruthy();
  });
});
