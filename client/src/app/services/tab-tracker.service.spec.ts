import { TestBed } from '@angular/core/testing';

import { TabTrackerService } from './tab-tracker.service';

describe('TabTrackerService', () => {
  let service: TabTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
