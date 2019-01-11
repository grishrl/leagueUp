import { TestBed } from '@angular/core/testing';

import { AclServiceService } from './acl-service.service';

describe('AclServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AclServiceService = TestBed.get(AclServiceService);
    expect(service).toBeTruthy();
  });
});
