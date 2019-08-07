import { Injectable } from '@angular/core';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private httpService: HttpServiceService) { }

  getPastSeasons(){
    let url = '/history/seasons';
    return this.httpService.httpGet(url, false, false);
  }

  getSeasonDivisions(season){
    let url = '/history/season/divisions';
    let param = [
      {'season':season}
    ]
    return this.httpService.httpGet(url, param, false);
  }

  getPastTeamsViaSeason(teams, season){
    let url = '/history/season/teams';
    let param =
      {
        'season': season,
        'teams':teams
      }

    return this.httpService.httpPost(url, param, false);
  }
}
