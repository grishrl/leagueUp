import { TestBed } from '@angular/core/testing';

import { TimeserviceService } from './timeservice.service';

describe('TimeserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeserviceService = TestBed.get(TimeserviceService);
    expect(service).toBeTruthy();
  });
});
