import { Injectable } from '@angular/core';
import { UtilitiesService } from './utilities.service';
import { environment } from '../../environments/environment';
import { HttpServiceService } from './http-service.service';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroesProfileService {

  constructor(private util:UtilitiesService, private http: HttpServiceService) { }

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

  getNgsHpPlayerLink(toonHandle, displayName){
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
      return environment.heroesProfilePlayer + 'region=' + region + '&blizz_id=' + blizz_id + '&battletag=' + battletag + '&season=';
    }
  }

  public getHPProfileLinkStream: Subject<string> = new Subject();

getHPProfileLink(toonHandle, displayName) {
    let returnUrl = '';
    //https://www.heroesprofile.com/Profile/?blizz_id=7905329&battletag=wraithling&region=1
    if (this.util.isNullOrEmpty(toonHandle)) {

      this.http.httpGet('user/hero-profile/path', [{'displayName':encodeURIComponent(displayName)}]).subscribe(
        res=>{
          if(res){
            let blizz_id = res.blizz_id;
            let region = res.region;
            let splitName = displayName.split('#');
            let battletag = splitName[0];
            returnUrl = environment.heroesProfile + 'region=' + region + '&blizz_id=' + blizz_id + '&battletag=' + battletag;
            this.getHPProfileLinkStream.next(returnUrl);
          }else{
            this.getHPProfileLinkStream.next(null);
          }

      })
    } else {
      //1-Hero-1-848842
      let splitToonHandle = toonHandle.split('-');
      let region = splitToonHandle[2];
      let blizz_id = splitToonHandle[3];
      let splitName = displayName.split('#');
      let battletag = splitName[0];
      returnUrl = environment.heroesProfile + 'region=' + region + '&blizz_id=' + blizz_id + '&battletag=' + battletag;
      this.getHPProfileLinkStream.next(returnUrl);
    }
  }

}
