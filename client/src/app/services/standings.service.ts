import { Injectable } from '@angular/core';
import { HttpServiceService } from './http-service.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {

  //accepts the divisionConcat and returns the standings of the division based on reported matches
  getStandings(div:string){
    let url = 'standings/get/division';
    let payload = {
      division:div,
      season:environment.season
    };
    return this.httpService.httpPost(url, payload);
  }

  constructor(private httpService: HttpServiceService) { }
}
