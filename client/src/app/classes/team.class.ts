export class Team {
  _id: string;
  teamName: string; //added to display form 
  teamName_lower: string 
  teamDivision: division; //added to display form
  //"stats": string; //later addition of team statistics
  lookingForMore: Boolean; //added to display form
  lfmDetails: lfmSchema;
  captain: string;
  teamMMRAvg: number; //added to display
  teamMembers: [miniUser]; //added to display
  pendingMembers: [miniUser];

  constructor(id: string, teamName: string, lookingForMore: Boolean, lfmDetails: lfmSchema, 
    teamMembers: [miniUser], pendingMembers: [miniUser], captain: string, teamMMRAvg:number,
    teamDivision: division) {
    if (id != null && id != undefined && id.length > 0) {
      this._id = id;
    } else {
      this._id = "";
    }
    if (teamName != null && teamName != undefined && teamName.length > 0) {
      this.teamName = teamName;
      this.teamName_lower = teamName.toLowerCase()
    } else {
      this.teamName, this.teamName_lower = "";
    }
    if (lookingForMore != null && lookingForMore != undefined) {
      this.lookingForMore = lookingForMore;
    } else {
      this.lookingForMore = false;
    }
    if (lfmDetails != null && lfmDetails != undefined) {
      this.lfmDetails = lfmDetails;
    } else {
      this.lfmDetails = {
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
        "competitiveLevel": null,
        "descriptionOfTeam": "",
        "rolesNeeded": { "tank": false, "assassin": false, "support": false, "offlane": false, "specialist": false }, //form input added,
        "timeZone": ""
      }
      

    }
    if (teamMembers != null && teamMembers != undefined) {

      this.teamMembers = teamMembers;
    } else {
      this.teamMembers = null;
    }
    if(pendingMembers != null && pendingMembers != undefined){
      this.pendingMembers = pendingMembers
    }else{
      this.pendingMembers = null;
    }
      if(captain != null && captain != undefined){
        this.captain = captain;
      }else{
        this.captain = null;
      }
      if(teamMMRAvg != null && teamMMRAvg != undefined){
        this.teamMMRAvg = teamMMRAvg
      }else{
        this.teamMMRAvg = 0;
      }
      if(teamDivision!=null && teamDivision !=undefined){
        this.teamDivision = teamDivision;
      }else{
        this.teamDivision = null;
      }
  }
}

interface lfmSchema {
  "availability": Object,
  "competitiveLevel": number,
  "descriptionOfTeam": string,
  "rolesNeeded": Object,
  "timeZone": string
}

interface division{
  "divisionName":string,
  "coastalDivision":string
}

interface miniUser {
  "displayName": string
}