import { TestBed } from '@angular/core/testing';

import { HotsLogsService } from './hots-logs.service';

describe('HotsLogsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HotsLogsService = TestBed.get(HotsLogsService);
    expect(service).toBeTruthy();
  });
});
