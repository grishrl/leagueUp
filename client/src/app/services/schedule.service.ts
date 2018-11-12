import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http:HttpClient) { }

  getScheduleMatches(season, division, round){  
    let url = 'http://localhost:3000/schedule/getSchedule';
    let payload = {
      'season':season,
      'division':division,
      'round':round
    };
    return this.http.post(url, payload).pipe( map(
      res=>{
        return res['returnObject'];
      }
    ) )

  }

  scheduleMatchTime(){
    
  }
}
