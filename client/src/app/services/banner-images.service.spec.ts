import { TestBed } from '@angular/core/testing';

import { BannerImagesService } from './banner-images.service';

describe('BannerImagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BannerImagesService = TestBed.get(BannerImagesService);
    expect(service).toBeTruthy();
  });
});
