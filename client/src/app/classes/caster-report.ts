export class CasterReport {
  casterName: String;
  casterId: string;
  coCasters: Array<string>;
  coCasterIds: Array<string>;
  matchId: string;
  division: string;
  vodLinks: Array<string>;
  issues: string;
  season: number;
  event: string;
  playlistCurrated: boolean;
  error: string;

  constructor() {
    this.casterName = null;
    this.casterId = null;
    this.coCasterIds = [];
    this.coCasters = [];
    this.matchId = null;
    this.division = null;
    this.vodLinks = [];
    this.issues = null;
    this.season = null;
    this.event = null;
    this.playlistCurrated = null;
    this.error = null;
  }
}
