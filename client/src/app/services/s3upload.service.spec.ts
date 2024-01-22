import { TestBed } from '@angular/core/testing';

import { S3uploadService } from './s3upload.service';

describe('S3uploadService', () => {
  let service: S3uploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(S3uploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
