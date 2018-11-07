import { TestBed } from '@angular/core/testing';

import { QueuesService } from './queues.service';

describe('QueuesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QueuesService = TestBed.get(QueuesService);
    expect(service).toBeTruthy();
  });
});
