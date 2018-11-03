import { TestBed } from '@angular/core/testing';

import { MarkdownParserService } from './markdown-parser.service';

describe('MarkdownParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MarkdownParserService = TestBed.get(MarkdownParserService);
    expect(service).toBeTruthy();
  });
});
