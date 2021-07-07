import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  joinTeamRequest(team){
    let url = '/request/team/join';
    let payload = {
      teamName:team
    };
    return this.httpService.httpPost(url, payload, true);
  }

  approveTeamRequest(team,user, act, id){
    let url ='/request/team/join/response';
    let payload = {
      teamName:team,
      addMember:user,
      approval:act,
      messageId:id
    }
    return this.httpService.httpPost(url, payload, true);
  }

  inviteToTeamRequest(teamname, username){
    let url = '/request/user/join';
    let payload = {
      teamName:teamname,
      userName:username
    }
    return this.httpService.httpPost(url, payload, true);
  }

  acceptTeamInvite(team, user, act, id){
    let url = '/request/user/join/response';
    let payload = {
      teamName: team,
      addMember: user,
      approval: act,
      messageId: id
    }
    return this.httpService.httpPost(url, payload, true);
  }

  constructor(private httpService: HttpService) { }
}
