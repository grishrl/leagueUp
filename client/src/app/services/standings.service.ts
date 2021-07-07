import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { TimeService } from './time.service';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {

  //accepts the divisionConcat and returns the standings of the division based on reported matches
  getStandings(div:string){
    let url = 'standings/fetch/division';
    return this.timeService.getSesasonInfo().pipe(
      switchMap(
        res=>{
          let payload = {
            division: div,
            season: res['value']
          };
          return this.httpService.httpPost(url, payload);
        }
      )
    )

  }

  getPastStandings(div: string, season) {
    let url = 'standings/fetch/division';
    let payload = {
      division: div,
      season: season,
      pastSeason:true
    };
    return this.httpService.httpPost(url, payload);

  }


  constructor(private httpService: HttpService, private timeService:TimeService) {
   }
}
