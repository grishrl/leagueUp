
export class Match {
  home: teamInfo;
  away: teamInfo;
  matchId: string;
  round:string;
  divisionConcat:string;
  scheduledTime: schedule;
  casterName: string;
  casterUrl: string;
  replays: {
    [key:string]:Replay
  };
  forfeit: boolean;
  other: any;
  vodLinks:Array<string>;
  mapBans: mapBans;
  season: number;
  boX:number;
  type:string;
  reported:boolean;
  notes:string;
  title:string;

  constructor() {
    this.home = {
      teamName: '',
      logo: '',
      wins: null,
      losses: null,
      score: null,
      dominator: false
    }
    this.away = {
      teamName: '',
      logo: '',
      wins: null,
      losses: null,
      score: null,
      dominator: false
    }
    this.scheduledTime = {
      startTime: null,
      endTime: null
    },
    this.type = '';
    this.matchId=null;
    this.round = null;
    this.divisionConcat = null;
    this.forfeit = null;
    this.casterName = '';
    this.casterUrl = '';
    this.other = {};
    this.replays = {};
    this.vodLinks = [];
    this.mapBans = {
      awayOne: '',
      awayTwo: '',
      homeOne: '',
      homeTwo: ''
    };
    this.title = null;
    this.season=null;
    this.boX = null;
    this.reported = false;
    this.notes = null;
  }
}

export interface Replay {
  data:string,
  url:string,
  parsedUrl:string,
  map?:string,
  winner?:string
}


export interface teamInfo {
  teamName: string,
  logo: string,
  wins: string,
  losses: string,
  score: any,
  dominator: boolean
}

export interface schedule {
  startTime: any,
  endTime: any
}

export interface mapBans {
  awayOne: string,
  awayTwo: string,
  homeOne: string,
  homeTwo: string
}
