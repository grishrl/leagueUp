export class Team {
  _id: String;
  teamName: String; //added to display form 
  teamDivision: division; //added to display form
  //"stats": String; //later addition of team statistics
  lookingForMore: Boolean; //added to display form
  lfmDetails: lfmSchema;
  captain: String;
  teamMMRAvg: Number; //added to display
  teamMembers: [miniUser]; //added to display
  pendingMembers: [miniUser];

  constructor(id: String, teamName: String, lookingForMore: Boolean, lfmDetails: lfmSchema, 
    teamMembers: [miniUser], pendingMembers: [miniUser], captain: String, teamMMRAvg:Number,
    teamDivision: division) {
    if (id != null && id != undefined && id.length > 0) {
      this._id = id;
    } else {
      this._id = "";
    }
    if (teamName != null && teamName != undefined && teamName.length > 0) {
      this.teamName = teamName;
    } else {
      this.teamName = "";
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
        "desctiptionOfTeam": "",
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
  "competitiveLevel": Number,
  "desctiptionOfTeam": String,
  "rolesNeeded": Object,
  "timeZone": String
}

interface division{
  "divisionName":string,
  "coastalDivision":string
}

interface miniUser {
  "systemId": String,
  "displayName": String
}