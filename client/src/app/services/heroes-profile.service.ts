import { Injectable } from '@angular/core';
import { UtilitiesService } from './utilities.service';
import { environment } from '../../environments/environment';
import { HttpServiceService } from './http-service.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HotsProfileService {

  constructor(private util:UtilitiesService, private http: HttpServiceService, private httpClient:HttpClient) { }

  getTopStats(stat){
    let url = '/user/frontPageStats'
    let params = [
      {'stat':stat}
    ];
    return this.http.httpGet(url, params, false);
  }

  getReplay(id){
    let url = '/utility/replay/map/name'
    let params = [
      {id:id}
    ];
    return this.http.httpGet(url, params, false);
  }

  getOverallLeagueStats() {
    let url = '/user/leagueOverallStats'
    let params = [];
    return this.http.httpGet(url, params, false);
  }

  getHPTeamLink(teamName){
    //https://heroesprofile.com/NGS/Team/Single/?team=TEST%20aggressive%20quorums%20(withdrawn)
    if(this.util.isNullOrEmpty(teamName)){
      return '';
    }else{
      teamName = encodeURIComponent(teamName);
      return environment.heroesProfileTeam+teamName;
    }
  }

  getHPPlayerLink(toonHandle, displayName){
    //https://www.heroesprofile.com/NGS/Profile/?region=1&blizz_id=2201809&battletag=Mongoose
    if (this.util.isNullOrEmpty(toonHandle)) {
      return '';
    } else {
      //1-Hero-1-848842
      let splitToonHandle = toonHandle.split('-');
      let region = splitToonHandle[2];
      let blizz_id = splitToonHandle[3];
      let splitName = displayName.split('#');
      let battletag = splitName[0];
      return environment.heroesProfilePlayer + 'region=' + region + '&blizz_id=' + blizz_id + '&battletag=' + battletag;
    }
  }

  getMMRdisplayName(displayName) {
    let heroesProfileURL = 'https://heroesprofile.com/API/MMR/Player/?api_key=ngs!7583hh&region=1&p_b=';
    heroesProfileURL += encodeURIComponent(displayName);
    return this.httpClient.get(heroesProfileURL).pipe(
      map(res => {
        let data = res[displayName.toString()];
        let slGames = parseInt(data["Storm League"].games_played);
        let val;
        if (slGames > 150) {
          val = data["Storm League"].mmr;
        } else {
          let slMMR = data["Storm League"].mmr;
          let tlMMR = data["Team League"].mmr;
          let tlGames = parseInt(data["Team League"].games_played);
          let totalGames = slGames + tlGames
          if (totalGames > 150) {
            val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames));
          } else {
            let hlGames = parseInt(data["Hero League"].games_played);
            let hlMMR = data["Hero League"].mmr;
            totalGames = hlGames + tlGames + slGames;
            if (totalGames > 150) {
              val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames));
            } else {
              let urGames = parseInt(data["Unranked Draft"].games_played);
              let urMMR = data["Unranked Draft"].mmr;
              totalGames = hlGames + tlGames + slGames + urGames;
              if (totalGames > 150) {
                val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames));
              } else {
                let qmGames = parseInt(data["Quick Match"].games_played);
                let qmMMR = data["Quick Match"].mmr;
                totalGames = hlGames + tlGames + slGames + urGames + qmGames;
                if (totalGames > 150) {
                  val = (slMMR * (slGames / totalGames)) + (tlMMR * (tlGames / totalGames)) + (hlMMR * (hlGames / totalGames)) + (urMMR * (urGames / totalGames)) + (qmMMR * (qmGames / totalGames));
                } else {
                  val = 0;
                }
              }
            }
          }
        }
        return val;
      })
    )
  }

}
