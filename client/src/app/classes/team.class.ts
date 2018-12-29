export class Team {
  _id: string;
  logo: string;
  teamName: string; //added to display form 
  teamName_lower: string ;
  divisionDisplayName: string;
  divisionConcat: string;
  //"stats": string; //later addition of team statistics
  lookingForMore: Boolean; //added to display form
  availability: schedule;
  competitiveLevel: number;
  rolesNeeded: roles;
  descriptionOfTeam: string;
  timeZone: string;
  captain: string;
  teamMMRAvg: number; //added to display
  teamMembers: [string]; //added to display
  pendingMembers: [string];
  


  constructor(id: string, logo:string, teamName: string, lookingForMore: Boolean, availability:schedule,
    competitiveLevel: number, rolesNeeded: roles, descriptionOfTeam: string, timeZone: string,
    teamMembers: [string], pendingMembers: [string], captain: string, teamMMRAvg:number,
    divisionDisplayName: string, divisionConcat:string) {
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
      }
    }
    if (competitiveLevel != null && competitiveLevel != undefined){
      this.competitiveLevel = competitiveLevel;
    }else{
      this.competitiveLevel = null;
    }
    if(descriptionOfTeam!=null&&descriptionOfTeam!=undefined){
      this.descriptionOfTeam = descriptionOfTeam;
    }else{
      this.descriptionOfTeam = null;
    }
    if(rolesNeeded!=null&&rolesNeeded!=undefined){
      this.rolesNeeded = rolesNeeded;
    }else{
      this.rolesNeeded = { "tank": false, "assassin": false, "support": false, "offlane": false, "specialist": false };
    }
    if(timeZone!=null&&timeZone!=undefined){
      this.timeZone=timeZone;
    }else{
      this.timeZone = "";
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
      if(divisionDisplayName!=null && divisionDisplayName !=undefined){
        this.divisionDisplayName = divisionDisplayName;
      }else{
        this.divisionDisplayName = null;
      }
    if (divisionConcat != null && divisionConcat != undefined) {
      this.divisionConcat = divisionConcat;
    } else {
      this.divisionConcat = null;
    }
  }
}

interface schedule {
  monday: atset,
  tuesday: atset,
  wednesday: atset,
  thursday: atset,
  friday: atset,
  saturday: atset,
  sunday: atset
}

interface atset {
  available: boolean,
  startTime: number,
  endTime: number
}

interface roles {
  tank: boolean,
  assassin: boolean,
  offlane: boolean,
  support: boolean,
  specialist: boolean
}
