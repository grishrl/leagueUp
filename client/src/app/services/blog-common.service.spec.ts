import { TestBed } from '@angular/core/testing';

import { BlogCommonService } from './blog-common.service';

describe('BlogCommonService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlogCommonService = TestBed.get(BlogCommonService);
    expect(service).toBeTruthy();
  });
});
