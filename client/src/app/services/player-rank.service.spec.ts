import { TestBed } from '@angular/core/testing';

import { PlayerRankService } from './player-rank.service';

describe('PlayerRankService', () => {
  let service: PlayerRankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerRankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
