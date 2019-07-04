import { TestBed } from '@angular/core/testing';

import { HeroesProfileService } from './heroes-profile.service';

describe('HeroesProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HeroesProfileService = TestBed.get(HeroesProfileService);
    expect(service).toBeTruthy();
  });
});
