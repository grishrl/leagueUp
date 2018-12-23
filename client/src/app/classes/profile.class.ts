export class Profile {  //addition of stats for future plans
  _id:String;
  displayName: String;
  lookingForGroup : Boolean;
  lfgDetails: lfgSchema;
  teamInfo:  miniTeam;
  __v: String;//useless


  constructor (id: String, displayName: String, lookingForGroup: Boolean, lfgDetails: lfgSchema, teamInfo: miniTeam){
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
  if (lookingForGroup != null && lookingForGroup != undefined) {
    this.lookingForGroup = lookingForGroup;
  } else {
    this.lookingForGroup = false;
  }
  if (lfgDetails != null && lfgDetails != undefined) {
    this.lfgDetails = lfgDetails;
  } else {
    this.lfgDetails = {
      "availability": {
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
      },
      "averageMmr":null,
      "competitiveLevel":null, 
      "descriptionOfPlay":"",
      "role": { "tank": false, "assassin": false, "support": false, "offlane": false, "specialist": false }, //form input added,
      "timeZone":"",
      "heroLeague":{"metal":"","division":null},
      "hotsLogsURL":""
  }
  if (teamInfo != null && teamInfo != undefined) {
    this.teamInfo = teamInfo;
  } else {
    this.teamInfo = { "teamName": "", "teamId": "" };
  }

}

}
}


export interface hlRankShema {
    metal: String; //Form input added
    division: number; //Form input added
}

export interface miniTeam{
    teamName: String; //form input added
    teamId: String;
}

export interface lfgSchema {
  availability: schedule; //form input added
  competitiveLevel: number; //form input added
  descriptionOfPlay: String; //form input added
  role: roles; //
  averageMmr: number;  //user average mmr
  timeZone: String; //form input added
  heroLeague: hlRankShema;
  hotsLogsURL: String; //form input added
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

export interface roles {
  tank: boolean,
  assassin:boolean,
  offlane:boolean,
  support:boolean,
  specialist:boolean
}

export enum Metal{
  GrandMaster = "GRAND MASTER",
  Master = "MASTER",
  Diamond = "DIAMOND",
  Platinum = "PLATINUM",
  Gold = "GOLD",
  Silver = "SILVER",
  Bronze = "BRONZE"
}
