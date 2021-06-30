export class Team {
  _id: string;
  logo: string;
  teamName: string; //added to display form
  teamName_lower: string;
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
  history: Array<history>;
  teamMMRAvg: number; //added to display
  teamMembers: [{ displayName: string }]; //added to display
  pendingMembers: [{ displayName: string }];
  invitedUsers: Array<any>;
  questionnaire: questionnaire;
  hpMmrAvg: number;
  ngsMmrAvg: number;
  assistantCaptain: Array<string>;
  ticker: string;
  twitch: string;
  twitter: string;
  youtube: string;
  stormRankAvg: number;

  constructor(
    id: string,
    logo: string,
    teamName: string,
    lookingForMore: Boolean,
    availability: schedule,
    competitiveLevel: number,
    rolesNeeded: roles,
    descriptionOfTeam: string,
    timeZone: string,
    teamMembers: [{ displayName: string }],
    pendingMembers: [{ displayName: string }],
    captain: string,
    teamMMRAvg: number,
    divisionDisplayName: string,
    divisionConcat: string,
    questionnaire: questionnaire
  ) {
    if (id != null && id != undefined && id.length > 0) {
      this._id = id;
    } else {
      this._id = "";
    }
    if (teamName != null && teamName != undefined && teamName.length > 0) {
      this.teamName = teamName;
      this.teamName_lower = teamName.toLowerCase();
    } else {
      this.teamName, (this.teamName_lower = "");
    }
    if (lookingForMore != null && lookingForMore != undefined) {
      this.lookingForMore = lookingForMore;
    } else {
      this.lookingForMore = false;
    }
    if (availability != null && availability != undefined) {
      this.availability = availability;
    } else {
      this.availability = {
        monday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        tuesday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        wednesday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        thursday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        friday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        saturday: {
          available: false,
          startTime: null,
          endTime: null,
        },
        sunday: {
          available: false,
          startTime: null,
          endTime: null,
        },
      };
    }
    if (competitiveLevel != null && competitiveLevel != undefined) {
      this.competitiveLevel = competitiveLevel;
    } else {
      this.competitiveLevel = null;
    }
    if (descriptionOfTeam != null && descriptionOfTeam != undefined) {
      this.descriptionOfTeam = descriptionOfTeam;
    } else {
      this.descriptionOfTeam = null;
    }
    if (rolesNeeded != null && rolesNeeded != undefined) {
      this.rolesNeeded = rolesNeeded;
    } else {
      this.rolesNeeded = {
        tank: false,
        meleeassassin: false,
        rangedassassin: false,
        support: false,
        offlane: false,
        healer:false,
        flex: false,
      };
    }
    if (timeZone != null && timeZone != undefined) {
      this.timeZone = timeZone;
    } else {
      this.timeZone = "";
    }
    if (teamMembers != null && teamMembers != undefined) {
      this.teamMembers = teamMembers;
    } else {
      this.teamMembers = null;
    }
    if (pendingMembers != null && pendingMembers != undefined) {
      this.pendingMembers = pendingMembers;
    } else {
      this.pendingMembers = null;
    }
    if (captain != null && captain != undefined) {
      this.captain = captain;
    } else {
      this.captain = null;
    }
    if (teamMMRAvg != null && teamMMRAvg != undefined) {
      this.teamMMRAvg = teamMMRAvg;
    } else {
      this.teamMMRAvg = 0;
    }
    if (divisionDisplayName != null && divisionDisplayName != undefined) {
      this.divisionDisplayName = divisionDisplayName;
    } else {
      this.divisionDisplayName = null;
    }
    if (divisionConcat != null && divisionConcat != undefined) {
      this.divisionConcat = divisionConcat;
    } else {
      this.divisionConcat = null;
    }
    if (questionnaire != null && questionnaire != undefined) {
      this.questionnaire = questionnaire;
    } else {
      this.questionnaire = {
        registered: null,
        pickedMaps: [],
      };
    }
    this.assistantCaptain = [];
    this.ticker = null;
    this.history = [];
    this.hpMmrAvg = null;
    this.ngsMmrAvg = null;
    this.twitch = null;
    this.twitter = null;
    this.youtube = null;
    this.invitedUsers = [];
    this.stormRankAvg = 0;
  }
}

interface questionnaire{
  registered:boolean,
  pickedMaps:Array<string>
}

interface history{
  season:number,
  target:string,
  timestamp:string,
  action:string
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
  'meleeassassin': boolean,
  'rangedassassin':boolean,
  offlane: boolean,
  support: boolean,
  healer:boolean,
  flex: boolean
}
