import { TestBed } from '@angular/core/testing';

import { S3uploadServiceService } from './s3upload-service.service';

describe('S3uploadServiceService', () => {
  let service: S3uploadServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(S3uploadServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
