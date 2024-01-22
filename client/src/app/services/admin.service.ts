import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Team } from '../classes/team.class';
import { FilterService } from '../services/filter.service';
import { SpecialCharactersService } from './special-characters.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(
    private httpService: HttpService,
    private FS: FilterService,
    private charServ: SpecialCharactersService
  ) {}

  //uploads team logo
  imageUpload(imgInput) {
    let url = "/utility/image/upload";
    return this.httpService.httpPost(url, imgInput, true);
  }

  getLogs() {
    let url = "/admin/logs";
    return this.httpService.httpGet(url, [], false);
  }

  archiveSeason() {
    let url = "admin/season/reset";
    return this.httpService.httpPost(
      url,
      {
        password: "resetseason",
      },
      true
    );
  }

    upsertMvp( mvp ){
    let url = '/admin/mvp/upsert';
    return this.httpService.httpPost(url, mvp, true);
  }

  teamLogoUpload(img, teamName?) {
    let url = "/admin/team/uploadLogo";
    let imgInput;
    if (typeof img != "object") {
      imgInput = {
        logo: img,
        teamName: teamName,
      };
    } else {
      imgInput = img;
    }
    return this.httpService.httpPost(url, imgInput, true);
  }

  teamRemoveLogo(team) {
    let url = "/admin/team/removeLogo";
    let payload = {
      teamName: team,
    };
    return this.httpService.httpPost(url, payload, true);
  }

    //returns requested team
  getTeam(name?:string, ticker?:string, id?:string):Observable<any>{
    let url = 'admin/team/get';
    let params = [];
    if(name){
      let encodededID = encodeURIComponent(this.realTeamName(name));
      params.push({ team: encodededID });
    }
    if(ticker){
      params.push({ ticker: ticker });
    }
    if (id) {
      let encodededID = encodeURIComponent(id);
      params.push({ teamId: encodededID });
    }
    return this.httpService.httpGet(url, params);
  };

    //returns team name re formatted with spaces
  realTeamName(teamname):string{
    if (teamname != null && teamname != undefined) {
      return this.charServ.reverse(teamname)
    } else {
      return '';
    }

  }

  //returns a list of all teams
  getTeams() {
    let url = "admin/get/teams/all";
    return this.httpService.httpGet(url, []);
  }

  //returns a list of teams not assigned to division
  getTeamsNotDivisioned() {
    let url = "admin/getTeamsUndivisioned";

    return this.httpService.httpGet(url, []);
  }

  generateSeason(seas) {
    let url = "schedule/generate/schedules";
    let payload = {
      season: seas,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  /*
  teams, season, division, cupNumber, tournamentName, description
  */

  generateTournament(teams, season, name, division, cupNumber, description, type) {
    let url = "/schedule/generate/tournament";
    let payload = {
      teams: teams,
      season: season,
      tournamentName: name,
      division: division,
      cupNumber: cupNumber,
      description: description,
      type:type
    };
    return this.httpService.httpPost(url, payload, true);
  }

  validateSeason(seas) {
    let url = "schedule/check/valid";
    let payload = {
      season: seas,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //forfeit games
  forfeitTeam(team: string) {
    let url = "admin/forfeit/team";
    let payload = {
      teamName: team
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //admin function to remove memvers from team accepts team name and name of user to remove
  //member can be an array of strings or string
  removeMembers(team: string, member) {
    let url = "admin/team/removeMember";
    let payload = {
      teamName: team,
      removeUser: member,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  removeInvitedMembers(team: string, member) {
    let url = "admin/team/removeInvitedMember";
    let payload = {
      teamName: team,
      removeUser: member,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //refreshes specified teams MMR
  refreshTeamMMR(team) {
    let url = "admin/team/refreshMmr";
    let payload = {
      teamName: team,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //edits division, accepts the division object and division name: divisionConcat
  saveDivisionEdits(divname, divobj) {
    let url = "admin/upsertDivision";
    let payload = {
      divObj: divobj,
      divName: divname,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //calculates the teams MMR based on the provided usersMmr and the team's name
  resultantMmr(userMmr, userName, teamName) {
    let url = "/admin/resultantmmr";
    let payload = {
      userMmr: userMmr,
      displayName:userName,
      teamName: teamName,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //moves teams provided into the division provided
  //divisionConcat, array of team names as string
  divisionTeam(teamArr: string[], divisionName: string) {
    let url = "admin/divisionTeams";
    let payload = {
      teamInfo: teamArr,
      divisionName: divisionName,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //removes teams provided from the division provided
  //divisionConcat, array of string names to remove
  removeTeams(teamArr: string[], divName: string) {
    let url = "admin/removeTeams";
    let payload = {
      teams: teamArr,
      divName: divName,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //returns list of all divisions
  getDivisionList() {
    let url = "admin/getDivisionInfo";

    return this.httpService.httpGet(url, []).pipe(
      map((res) => {
        let divisionArr = res;
        divisionArr.sort((a, b) => {
          return this.FS.arrangeDivisions(a, b);
        });
        return divisionArr;
      })
    );
  }

  //returns to the pending member queue the admins approval or declining of a team member add
  queuePost(teamName: string, memberName: string, action: boolean) {
    let url = "admin/approveMemberAdd";
    let payload = {
      teamId: teamName,
      memberId: memberName,
      approved: action,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //add notes to pmq item
  pmqAddNote(queueObj, note) {
    let url = "admin/pmq/addnote";
    let payload = {
      queue: queueObj,
      note,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //delete pending member add queue item
  deleteQueueItem(queueObj) {
    let url = "admin/pmq/delete";
    let payload = {
      queue: queueObj,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //returns to the pending member queue the admins approval or declining of a team member add
  avatarQueuePost(id: string, fileName: string, action: boolean) {
    let url = "admin/approveAvatar";
    let payload = {
      userId: id,
      fileName: fileName,
      approved: action,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes user from provided username
  deleteUser(user: string) {
    let url = "admin/delete/user";
    let payload = { displayName: user };
    return this.httpService.httpPost(url, payload, true);
  }

  saveUser(user) {
    let url = "/admin/user/save";
    let payload = {
      user: user,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  manualTeamAdd(user, team) {
    let url = "admin/team/memberAdd";
    let payload = {
      teamName: team,
      user: user,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes provided team by teamName
  deleteTeam(team) {
    let url = "admin/delete/team";
    team = team.toLowerCase();
    let payload = { teamName: team };
    return this.httpService.httpPost(url, payload, true);
  }

  //saves team name with provided teamName, and team Object
  saveTeam(teamName: string, teamObj: Team) {
    let url = "admin/teamSave";

    let payload = {
      teamName: teamName.toLowerCase(),
      teamObj: teamObj,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //changes captain of provided string to provided user
  changeCaptain(team: string, user: string) {
    let url = "admin/reassignCaptain";
    let payload = { teamName: team, userName: user };
    return this.httpService.httpPost(url, payload, true);
  }

  //creates division from provided division object
  createDivision(divObj) {
    let url = "admin/createDivision";
    let payload = { division: divObj };
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes division from provided division name divisionConcat
  deleteDivision(div: string) {
    let url = "admin/deleteDivision";
    let payload = { division: div };
    return this.httpService.httpPost(url, payload, true);
  }

  //posts updates made to match (accepts whole match object)
  matchUpdate(match) {
    let url = "admin/match/update";
    let payload = {
      match: match,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  setScheduleDeadline(div, time, endWeek) {
    let url = "admin/match/set/schedule/deadline";
    let payload = {
      division: div,
      date: time,
      endWeek: endWeek,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //returns list of all users and the access level lists
  getUsersAcls() {
    let url = "admin/user/get/usersacl/all";
    return this.httpService.httpGet(url, []);
  }

  //returns specified user and access level list
  getUserAcls(id) {
    let url = "admin/user/get/usersacl";
    let payload = {
      id: id,
    };
    return this.httpService.httpPost(url, payload);
  }

  //updates user ACL lists, accpets entire admin object
  upsertUserAcls(userACL) {
    let url = "admin/user/upsertRoles";
    return this.httpService.httpPost(url, userACL, true);
  }

  deleteReplay(matchId, prop) {
    let url = "admin/match/deletereplay";
    const payload = {
      matchId: matchId,
      replayProp: prop,
    };
    return this.httpService.httpPost(url, payload, true);
  }

  uploadReplay(payload) {
    let url = "admin/match/uploadreplay";

    return this.httpService.httpPost(url, payload, true);
  }

  createStream(obj) {
    let url = "/admin/match/create/stream/link";
    return this.httpService.httpPost(url, obj, true);
  }

  deleteStream(id) {
    let url = "/admin/match/delete/stream/link";
    let payload = { matchId: id };
    return this.httpService.httpPost(url, payload, true);
  }

  createGrandFinal(obj){
    let url = "/admin/match/create/grandfinal";
    return this.httpService.httpPost(url, obj, true);
  }
}
