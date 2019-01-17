import { Injectable } from '@angular/core';
import { HttpServiceService } from './http-service.service';

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

  approveTeamRequest(team,user){
    let url ='/request/team/join/response';
    let payload = {
      teamName:team,
      addMember:user
    }
    return this.httpService.httpPost(url, payload, true);
  }

  constructor(private httpService: HttpServiceService) { }
}
