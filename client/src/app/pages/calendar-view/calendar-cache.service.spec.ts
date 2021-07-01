import { TestBed } from '@angular/core/testing';

import { CalendarCacheService } from './calendar-cache.service';

describe('CalendarCacheService', () => {
  let service: CalendarCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
