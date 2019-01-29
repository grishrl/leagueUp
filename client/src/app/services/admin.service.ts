import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpServiceService } from './http-service.service';
import { Team } from '../classes/team.class';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpService: HttpServiceService) { }

  //returns a list of all teams
  getTeams(){
    let url = 'admin/get/teams/all';
    return this.httpService.httpGet(url,[]);
  }

  //returns a list of teams not assigned to division
  getTeamsNotDivisioned(){
    let url = 'admin/getTeamsUndivisioned';

    return this.httpService.httpGet(url, []);
  }

  generateSeason(seas){
    let url = 'schedule/generate/schedules';
    let payload = {
      season:seas
    }
    return this.httpService.httpPost(url, payload, true);
  }

  validateSeason(seas) {
    let url = 'schedule/check/valid';
    let payload = {
      season: seas
    }
    return this.httpService.httpPost(url, payload, true);
  }


  //admin function to remove memvers from team accepts team name and name of user to remove
  //member can be an array of strings or string
  removeMembers(team:string, member){
    let url = 'admin/team/removeMember';
    let payload = {
      teamName:team,
      removeUser:member
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //refreshes specified teams MMR
  refreshTeamMMR(team){
    let url = 'admin/team/refreshMmr';
    let payload = {
      teamName:team
    }
    return this.httpService.httpPost(url, payload, true);
  }


  //edits division, accepts the division object and division name: divisionConcat
  saveDivisionEdits(divname, divobj){
  let url = "admin/upsertDivision";
  let payload = {
    "divObj": divobj,
    "divName":divname
  };
    return this.httpService.httpPost(url, payload, true);
  }

  //calculates the teams MMR based on the provided usersMmr and the team's name
  resultantMmr(userMmr, teamName){
    let url ='/admin/resultantmmr';
    let payload = {
      userMmr: userMmr,
      teamName: teamName
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //moves teams provided into the division provided
  //divisionConcat, array of team names as string
  divisionTeam(teamArr: string[], divisionName:string){
    let url = "admin/divisionTeams";
    let payload = {
      teamInfo:teamArr,
      divisionName:divisionName
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //removes teams provided from the division provided
  //divisionConcat, array of string names to remove
  removeTeams(teamArr:string[], divName:string){
    let url = 'admin/removeTeams';
    let payload = {
      "teams":teamArr,
      "divName":divName
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //returns list of all divisions
  getDivisionList(){
    let url = 'admin/getDivisionInfo';

    return this.httpService.httpGet(url, []).pipe(
      map(res=>{
          let divisionArr = res;
          divisionArr.sort((a, b) => {
            if (a.sorting < b.sorting) {
              return -1;
            }
            if (a.sorting > b.sorting) {
              return 1
            }
            return 0;
          });
          return divisionArr;
        }
      )
    )
  }

  //returns to the pending member queue the admins approval or declining of a team member add
  queuePost(teamName:string, memberName:string, action:boolean){
    let url = 'admin/approveMemberAdd';
    let payload = {
      teamName:teamName,
      member:memberName,
      approved:action
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes user from provided username
  deleteUser(user:string){
    let url = 'admin/delete/user';
    let payload = {displayName:user};
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes provided team by teamName
  deleteTeam(team){
    let url = 'admin/delete/team';
    team = team.toLowerCase();
    let payload = { teamName : team};
    return this.httpService.httpPost(url, payload, true);
  }

  //saves team name with provided teamName, and team Object
  saveTeam(teamName:string, teamObj:Team){
     let url = 'admin/teamSave'

    let payload = {
      "teamName": teamName.toLowerCase(),
      "teamObj":teamObj
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //changes captain of provided string to provided user
  changeCaptain(team:string, user:string){
    let url = 'admin/reassignCaptain';
    let payload = { teamName: team, userName: user};
    return this.httpService.httpPost(url, payload, true);
  }

  //creates division from provided division object
  createDivision(divObj){
    let url = 'admin/createDivision';
    let payload = {division:divObj};
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes division from provided division name divisionConcat
  deleteDivision(div:string){
    let url = 'admin/deleteDivision';
    let payload = {division:div};
    return this.httpService.httpPost(url, payload, true);
  }

  //posts updates made to match (accepts whole match object)
  matchUpdate(match){
    let url = 'admin/match/update';
    let payload = {
      match:match
    };
    return this.httpService.httpPost(url, payload, true);
  }

  setScheduleDeadline(div, time, endWeek){
    let url = 'admin/match/set/schedule/deadline';
    let payload = {
      division:div,
      date:time,
      endWeek:endWeek
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //returns list of all users and the access level lists
  getUsersAcls(){
    let url = 'admin/user/get/usersacl/all';
    return this.httpService.httpGet(url, []);
  }

  //returns specified user and access level list
  getUserAcls(id) {
    let url = 'admin/user/get/usersacl';
    let payload = {
      id:id
    };
    return this.httpService.httpPost(url, payload);
  }

  //updates user ACL lists, accpets entire admin object
  upsertUserAcls( userACL ){
    let url ='admin/user/upsertRoles';
    return this.httpService.httpPost(url, userACL, true);
  }

}
