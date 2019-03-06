import { TestBed } from '@angular/core/testing';

import { HotsProfileService } from './hots-profile.service';

describe('HotsProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HotsProfileService = TestBed.get(HotsProfileService);
    expect(service).toBeTruthy();
  });
});
