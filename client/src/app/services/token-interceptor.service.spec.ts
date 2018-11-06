import { TestBed } from '@angular/core/testing';

import { ResponseInterceptor } from './token-interceptor.service';

describe('TokenInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResponseInterceptor = TestBed.get(ResponseInterceptor);
    expect(service).toBeTruthy();
  });
});
