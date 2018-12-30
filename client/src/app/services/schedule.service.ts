import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private http:HttpClient) { }

  getAllMatches(){
    let url = 'schedule/get/matches/all';
    let payload = {

    };
    return this.http.post(url,payload).pipe(map(
      res => {
        return res['returnObject'];
      }
    ))
  }

  getScheduleMatches(season, division, round){  
    // let url = 'http://localhost:3000/schedule/getSchedule';
    let url = 'schedule/get/matches';
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

  getTeamSchedules(season, team){
    // let url = 'http://localhost:3000/schedule/getTeamMatches';
    let url = 'schedule/get/matches/team';
    team = team.toLowerCase();
    let payload = {
      'season':season,
      'team':team
    };
    return this.http.post(url, payload).pipe(map(
      res=>{
        return res['returnObject'];
      }
    ));
  }

  getMatchInfo(season, matchId){
    // let url ="http://localhost:3000/schedule/getMatch";
    let url = 'schedule/get/match';
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

  scheduleMatchTime(matchId, scheduledStartTime, scheduledEndTime){
    // let url = 'http://localhost:3000/schedule/setMatchTime';
    let url = 'schedule/update/match/time';
  
    let payload = {
      "matchId":matchId,
      "scheduledStartTime": scheduledStartTime,
      "scheduledEndTime":scheduledEndTime
    }

    return this.http.post(url, payload).pipe( map(
      res=>{
        return res['returnObject'];
      }
    ))

  }

  reportMatch(payload){
    let url = 'schedule/report/match';
    let input = new FormData();

    let keys = Object.keys(payload);
    keys.forEach(element=>{
      input.append(element, payload[element]);
    });

    return this.http.post(url, input).pipe(map(
      res => {
        return res;
      }
    ))
  }

  // /match/add / caster
  addCaster(payload) {
    let url = 'schedule/match/add/caster';
    return this.http.post(url, payload).pipe(map(
      res => {
        return res;
      }
    ));
  }
}
