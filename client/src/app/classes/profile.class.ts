export class Profile {  //addition of stats for future plans
  _id:string;
  displayName: string;
  teamId: string;
  teamName: string;
  isCaptain:Boolean;
  hlRankMetal: string;
  hlRankDivision: number;
  //stats:object // not implemented
  //messageCenter: Array // not implemented
  lookingForGroup: Boolean;
  availability: schedule; //form input added
  competitiveLevel: number; //form input added
  descriptionOfPlay: string; //form input added
  role: roles; //
  timeZone: string; //form input added
  hotsLogsURL: string; //form input added
  averageMmr: number;  //user average mmr
  toonHandle:string;
  discordTag:string;
  pendingTeam:Boolean;
  history:Array<object>;
  hotsLogsPlayerID:string;
  seasonsPlayed:number;
  replays:Array<string>;
  replayArchive: Array<replayarchive>;
  smurfAccount:Boolean;
  __v: string;//useless


  constructor (id: string, displayName: string, teamId:string, teamName:string, isCaptain:boolean,
    hlRankMetal:string, hlRankDivision:number, lookingForGroup: Boolean, availability:schedule,
    competitiveLevel:number, descriptionOfPlay:string, role:roles, timeZone:string, hotsLogsURL:string,
    averageMmr: number, toonHandle: string, discordTag:string, history:Array<object>){
  if (id != null && id != undefined && id.length > 0) {
    this._id = id;
  } else {
    this._id = "";
  }
  if (displayName != null && displayName != undefined && displayName.length > 0) {
    this.displayName = displayName;
  } else {
    this.displayName = "";
  }
    if (teamId != null && teamId != undefined && teamId.length > 0) {
      this.teamId = teamId;
    } else {
      this.teamId = "";
    }
    if (teamName != null && teamName != undefined && teamName.length > 0) {
      this.teamName = teamName;
    } else {
      this.teamName = "";
    }
    if (isCaptain != null && isCaptain != undefined) {
      this.isCaptain = isCaptain;
    } else {
      this.isCaptain = null;
    }
    if (hlRankMetal != null && hlRankMetal != undefined && hlRankMetal.length > 0) {
      this.hlRankMetal = hlRankMetal;
    } else {
      this.hlRankMetal = "";
    }
    if (hlRankDivision != null && hlRankDivision != undefined ) {
      this.hlRankDivision = hlRankDivision;
    } else {
      this.hlRankDivision = null;
    }
  if (lookingForGroup != null && lookingForGroup != undefined) {
    this.lookingForGroup = lookingForGroup;
  } else {
    this.lookingForGroup = false;
  }
  if(availability != null && availability != undefined){
    this.availability = availability;
  }else{
    this.availability = {
      "monday": {
        "available": false,
        "startTime": null,
        "endTime": null
      },
      "tuesday": {
        "available": false,
        "startTime": null,
        "endTime": null
      },
      "wednesday": {
        "available": false,
        "startTime": null,
        "endTime": null
      }
      , "thursday": {
        "available": false,
        "startTime": null,
        "endTime": null
      }
      , "friday": {
        "available": false,
        "startTime": null,
        "endTime": null
      }
      , "saturday": {
        "available": false,
        "startTime": null,
        "endTime": null
      }
      , "sunday": {
        "available": false,
        "startTime": null,
        "endTime": null
      }
    };
  }
    if (competitiveLevel != null && competitiveLevel != undefined ) {
      this.competitiveLevel = competitiveLevel;
    } else {
      this.competitiveLevel = null;
    }
    if (descriptionOfPlay != null && descriptionOfPlay != undefined) {
      this.descriptionOfPlay = descriptionOfPlay;
    } else {
      this.descriptionOfPlay = null;
    }
    if (role != null && role != undefined) {
      this.role = role;
    } else {
      this.role = { "tank": false, "meleeassassin": false, "rangedassassin": false, "support": false, "healer":false,  "offlane": false, "flex": false };
    }
    if (timeZone != null && timeZone != undefined) {
      this.timeZone = timeZone;
    } else {
      this.timeZone = '';
    }
    if (hotsLogsURL != null && hotsLogsURL != undefined) {
      this.hotsLogsURL = hotsLogsURL;
    } else {
      this.hotsLogsURL = null;
    }
    if (averageMmr != null && averageMmr != undefined) {
      this.averageMmr = averageMmr;
    } else {
      this.averageMmr = null;
    }
    if (toonHandle != null && toonHandle != undefined) {
      this.toonHandle = toonHandle;
    } else {
      this.toonHandle = null;
    }
    if (discordTag != null && discordTag != undefined) {
      this.discordTag = discordTag;
    } else {
      this.discordTag = null;
    }
    if(history){
      this.history = history;
    }else{
      this.history = [];
    }
    this.seasonsPlayed = 0;
    this.replayArchive = [];
    this.replays = [];
}
}


export interface schedule {
  monday: atset,
  tuesday: atset,
  wednesday: atset,
  thursday: atset,
  friday: atset,
  saturday: atset,
  sunday: atset
}

export interface atset {
  available:boolean,
  startTime:number,
  endTime: number
}

export interface replayarchive {
  replays:Array<string>,
  season:number
}

export interface roles {
  tank: boolean,
  'meleeassassin': boolean,
  'rangedassassin': boolean,
  offlane: boolean,
  healer:boolean,
  support: boolean,
  flex: boolean
}
