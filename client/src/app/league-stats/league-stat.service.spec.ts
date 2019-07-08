import { TestBed } from '@angular/core/testing';

import { LeagueStatService } from './league-stat.service';

describe('LeagueStatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LeagueStatService = TestBed.get(LeagueStatService);
    expect(service).toBeTruthy();
  });
});
