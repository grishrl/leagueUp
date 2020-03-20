import { Injectable } from '@angular/core';
import { HttpServiceService } from './http-service.service';
import { TimeserviceService } from './timeservice.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  currentSeason;
  constructor(private httpService: HttpServiceService, private timeService:TimeserviceService) {

   }

   matchQuery(obj){
    let url = "schedule/query/matches";
    return this.httpService.httpPost(url, obj);
   }

  //returns all generated matches
  getAllMatches(){
    let url = 'schedule/get/matches/all';
    let payload = {

    };
    return this.httpService.httpPost(url, payload);
  }
  //schedule/get/matches/scheduled
  getAllMatchesWithStartTime(){
    let url = 'schedule/get/matches/scheduled';
    return this.timeService.getSesasonInfo().pipe(
      switchMap(
        res => {
          let payload = {
            season: res['value']
          };
          return this.httpService.httpGet(url, [payload]);
        }
      )

    );

  }

  getMatchupHistory(teamAid:string, teamBid:string){

    let url = 'schedule/get/matchup/history';
    let payload = {
      teamAid,teamBid
    }
    return this.httpService.httpPost(url, payload);
  }

  getMatchList(matches, season?){
    let url = 'schedule/get/match/list';
    let payload = {matches:matches};
    if(season){
      payload['season']=season
    };
    return this.httpService.httpPost(url, payload, false);
  }

  getLiveMatches(){
    let url = "schedule/get/matches/casted/playing";
    return this.httpService.httpGet(url, [], false);
  }

  //returns matches that match criteria of season, division
  getDivisionScheduleMatches(season, division: string) {
    let url = 'schedule/get/division/matches';
    let payload = {
      'season': season,
      'division': division
    };
    return this.httpService.httpPost(url, payload);
  };

  //returns matches that match criteria of season, division, round
  getScheduleMatches(season, division:string, round:number){
    let url = 'schedule/get/matches';
    let payload = {
      'season':season,
      'division':division,
      'round':round
    };
    return this.httpService.httpPost(url, payload);
  };

  //returns matches that match criteria of provided season and team
  getTeamSchedules(season:number, team:string){
    let url = 'schedule/get/matches/team';
    team = team.toLowerCase();
    let payload = {
      'season':season,
      'team':team
    };
    return this.httpService.httpPost(url, payload);
  }

  //returns a match given the matchId and season
  getMatchInfo(matchId:string){
    let url = 'schedule/get/match';
    let payload={
      "matchId":matchId
    }
    return this.httpService.httpPost(url, payload);
  }

  //accepts match id and two dates, schedules the provided match stard, and end times
  scheduleMatchTime(matchId:string, scheduledStartTime:number, scheduledEndTime:number){
    // let url = 'http://localhost:3000/schedule/setMatchTime';
    let url = 'schedule/update/match/time';

    let payload = {
      "matchId":matchId,
      "scheduledStartTime": scheduledStartTime,
      "scheduledEndTime":scheduledEndTime
    }
    return this.httpService.httpPost(url, payload, true);
  }

  getReportedMatches(sort?, limit?, showSnack?){
    let url = 'schedule/get/reported/matches';


    if (showSnack != undefined) {
      showSnack = showSnack
    } else {
      showSnack = true;
    }

    return this.timeService.getSesasonInfo().pipe(
      switchMap(
        res => {
          let payload = {
            season: res['value']
          };
          if(sort){
            payload['sortOrder'] = sort;
          }
          if(limit){
            payload['limit']=limit;
          }
          return this.httpService.httpPost(url, payload, showSnack)
        }
      )

    );
  }

  getReportedMatchesByDivision(division, showSnack?) {
    let url = 'schedule/get/reported/matches';

    if (showSnack != undefined) {
      showSnack = showSnack
    } else {
      showSnack = true;
    }
    return this.timeService.getSesasonInfo().pipe(
      switchMap(
        res => {
          let payload = {
            season: res['value'],
            division:division
          };
          return this.httpService.httpPost(url, payload, showSnack)
        }
      )

    );
  }

  getReportedMatchesByDivisionAndSeason(division, season, showSnack?) {
    let url = 'schedule/get/reported/matches';

    if (showSnack != undefined) {
      showSnack = showSnack
    } else {
      showSnack = true;
    }
    let payload = {
      division:division,
      season:season
    }
          return this.httpService.httpPost(url, payload, showSnack)

  }

  //get tournament
  getTournamentGames(name?, season?, division?){
    let url = '/schedule/fetch/tournament';
    let payload = {

    }
    if(name){
      payload['tournamentName']=name;
    }
    if (season) {
      payload['season'] = season;
    }
    if (division) {
      payload['division'] = division;
    }
    return this.httpService.httpPost(url, payload);
  }

  getTeamTournamentGames(season, teamId){
    let url = 'schedule/fetch/team/tournament/matches';
    let payload = {
      season:season,
      teamId:teamId
    };
    return this.httpService.httpPost(url, payload);
  }

  //accepts an object that contains elements for reporting the match outcome:
  /*
    {
      replay1:File,
      replay2:File,
      awayScore:number,
      homeScore:number,
      matchId:string
    }
  */
  reportMatch(payload){
    let url = 'schedule/report/match';
    let input = new FormData();

    let keys = Object.keys(payload);
    keys.forEach(element=>{
      input.append(element, payload[element]);
    });

    return this.httpService.httpPost(url, input, true);
  }

  // /match/add / caster
  addCaster(matchId:string, casterName:string, casterUrl:string) {
    let payload = {
      matchId:matchId,
      casterName:casterName,
      casterUrl:casterUrl
    }
    let url = 'schedule/match/add/caster';
    return this.httpService.httpPost(url, payload, true);
  }

  // /match/add / caster oneclickclaim
  addCasterOcc(matchId:string) {
    let payload = {
      matchId: matchId
    }
    let url = 'schedule/match/add/caster/occ';
    return this.httpService.httpPost(url, payload, true);
  }

  // my casted matches
  getMyCastedMatches() {
    let payload = {

    }
    let url = 'schedule/match/fetch/mycasted';
    return this.httpService.httpPost(url, payload, false);
  }
}
