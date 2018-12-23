import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http:HttpClient) { }

  getScheduleMatches(season, division, round){  
    // let url = 'http://localhost:3000/schedule/getSchedule';
    let url = 'schedule/getSchedule';
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

  };

  getTeamSchedules(season, team, division){
    // let url = 'http://localhost:3000/schedule/getTeamMatches';
    let url = 'schedule/getTeamMatches';
    team = team.toLowerCase();
    let payload = {
      'season':season,
      'team':team,
      'division':division
    };
    return this.http.post(url, payload).pipe(map(
      res=>{
        return res['returnObject'];
      }
    ));
  }

  getMatchInfo(season, matchId){
    // let url ="http://localhost:3000/schedule/getMatch";
    let url = 'schedule/getTeamMatches';
    let payload={
      "season":season,
      "matchId":matchId
    }
    return this.http.post(url, payload).pipe(
      map(
        res=>{
          return res['returnObject'];
        }
      )
    )
  }

  scheduleMatchTime(season, teams, division, round, matchId, scheduledStartTime){
    // let url = 'http://localhost:3000/schedule/setMatchTime';
    let url = 'schedule/setMatchTime';

    teams.forEach(element => {
      element = element.toLowerCase();
    });
    let payload = {
      "season":season,
      "teams":teams,
      "division":division,
      "round":round,
      "matchId":matchId,
      "scheduledStartTime": scheduledStartTime
    }

    return this.http.post(url, payload).pipe( map(
      res=>{
        return res['returnObject'];
      }
    ))

  }
}
