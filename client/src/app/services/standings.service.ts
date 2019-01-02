import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { HttpServiceService } from './http-service.service';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {

  //accepts the divisionConcat and returns the standings of the division based on reported matches
  getStandings(div:string){
    let url = 'standings/get/division';
    let payload = {
      division:div
    };
    return this.httpService.httpPost(url, payload);
  }

  constructor(private httpService: HttpServiceService) { }
}
