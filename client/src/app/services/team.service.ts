import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { Team } from '../classes/team.class';
import { SpecialCharactersService } from './special-characters.service';
import { TimeService } from 'src/app/services/time.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  //returns sys data
  getSysData(name:string){
    let url = 'team/get/sys/dat';
    let payload = {'data':name};
    return this.httpService.httpPost(url, payload);
  }

  getRegisteredTeams(){
    let url = '/team/get/registered';
    return this.httpService.httpGet(url, []);
  }

  captainLevel(team, user):boolean{
    let isCapt = false;
    if (team.assistantCaptain){
      if (user == team.captain || team.assistantCaptain.indexOf(user) > -1) {
        isCapt = true;
      }
    }else{
      isCapt = user == team.captain
    }

    return isCapt;
  }

  //returns requested team
  getTeam(name?:string, ticker?:string, id?:string):Observable<any>{
    let url = 'team/get';
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

  //retuns teams from an array of team names
  getTeams(names){
    let url = 'team/fetch/teams';
    let payload = {teams:names}
    return this.httpService.httpPost(url, payload)
  }

  //changes the teams captain to passed user
  changeCaptain(team:string, user:string){
    let url = 'team/reassignCaptain';
    team = team.toLowerCase();
    let payload = {
      teamName: team,
      username:user
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //deletes the passed team
  deleteTeam(team:string){
    let url = 'team/delete';
    team = team.toLowerCase();
    let payload = {teamName:team};
    return this.httpService.httpPost(url, payload, true);
  }

  //searches team via provided string
  teamSearch(team:string){
    let url = 'search/team';
    team = team.toLowerCase();
    let payload = {teamName:team};
    return this.httpService.httpPost(url, payload);
  }

  //create team
  createTeam(team:Team){
    let url = 'team/create';
    return this.httpService.httpPost(url, team, true);
  }

  //saves any changes to team info
  saveTeam(team:Team): Observable<any>{
    let url = 'team/save';
    return this.httpService.httpPost(url, team, true);
  }

  //saves team questionnaire
  saveTeamQuestionnaire(team, questionnaire) {
    let url = '/team/questionnaire/save';
    let payload = {
      teamName: team,
      questionnaire: questionnaire
    };
    return this.httpService.httpPost(url, payload, true);
  }

  //removes user from team members list
  removeUser(user:string, team:string){
    let url = '/team/removeMember';
    let payload = {
      remove: user,
      teamName: team
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //adds user to perscribed team
  addUser(user, team){
    let postData = {}
    if(typeof user!='object'){
      postData['teamName'] = team;
      postData['addMember']= user;
    }else{
      postData = user;
    }
    let url = 'team/addMember';
    return this.httpService.httpPost(url, postData, true);
  }

  //uploads team logo
  logoUpload(imgInput){
    let url = 'team/uploadLogo';
    return this.httpService.httpPost(url, imgInput, true);
  }

  //search for teams off certain criteria
  searchTeams(searchObj){
    let url = '/search/team/market';
    let payload = {
      searchObj:searchObj
    }
    return this.httpService.httpPost(url, payload, true);
  }

  //returns total number of teams
  getTeamNumber() {
    let url = '/search/teams/total';
    return this.httpService.httpGet(url, []);
  }

  getTeamsOfPageNum(page, msg?){
    let url = '/search/team/paginate';
    let payload = {
      page:page
    };
    return this.httpService.httpPost(url, payload, msg);
  }

  getTournaments(teamId){
    let url = '/schedule/fetch/team/tournament';
    let payload = {
      teamId:teamId
    };
    return this.httpService.httpPost(url, payload);
  }

  getActiveTournaments(teamId){
    let url = "/schedule/fetch/team/tournament/active";
        let payload = {
          teamId: teamId,
        };
        return this.httpService.httpPost(url, payload)
  }

  getSeasonTournaments(teamId, season){
    let url = "/schedule/fetch/team/tournament/season";
    let payload = {
      teamId:teamId,
      season:season,
    }
    return this.httpService.httpPost(url, payload);
  }



  //retuns a formatted string that includes the requisite info to retrieve an image from s3 bucket
  imageFQDN(img, season?) {
    if(season){
      let imgFQDN = 'https://s3.amazonaws.com/' + environment.s3bucketArchiveImage + '/';
            if (img) {
              imgFQDN += img;
            }
            else {
              imgFQDN = 'https://s3.amazonaws.com/' + environment.s3bucketImages + '/';
              imgFQDN += 'defaultTeamLogo.png';
            }
            return encodeURI(imgFQDN);

    }else{
      return this.returnCurrentFQDN(img);
    }
  }

  private returnCurrentFQDN(img: any) {
    let imgFQDN = 'https://s3.amazonaws.com/' + environment.s3bucketImages + '/';
    if (img) {
      imgFQDN += img;
    } else {
      imgFQDN += 'defaultTeamLogo.png';
    }
    return encodeURI(imgFQDN);
  }

  checkCanInvite(){
    let url = '/team/check/status';
    return this.httpService.httpGet(url, []);
  }



  //returns a route friendly URL name for a team, removing any spaces
  routeFriendlyTeamName(teamname):string{
    if(teamname!=null&&teamname!=undefined){
      let strArr = [];
      for(let i = 0; i<teamname.length; i++){
        strArr.push( teamname.charAt(i) );
      }
      strArr.forEach((char, index)=>{
        strArr[index] = this.charServ.replace(char);
      });
      return strArr.join('');
    }else{
      return '';
    }
  }

  //returns team name re formatted with spaces
  realTeamName(teamname):string{
    if (teamname != null && teamname != undefined) {
      return this.charServ.reverse(teamname)
    } else {
      return '';
    }

  }

  //   getStatistics(username){
  //   let encodedID = encodeURIComponent(username);
  //   let url = '/team/statistics';
  //   let params = [{ id: encodedID }];
  //   return this.httpService.httpGet(url, params);
  // }

  constructor(private httpService: HttpService, private charServ: SpecialCharactersService, private timeService:TimeService) { }
}
