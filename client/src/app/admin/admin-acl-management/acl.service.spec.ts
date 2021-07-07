import { TestBed } from '@angular/core/testing';

import { AclService } from './acl.service';

describe('AclService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AclService = TestBed.get(AclService);
    expect(service).toBeTruthy();
  });
});
