import { Injectable } from '@angular/core';
import { UtilitiesService } from './utilities.service';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HeroesProfileService {

  constructor(private util:UtilitiesService, private http: HttpService) { }

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
    /**
     * https://www.heroesprofile.com/Esports/NGS/Team2+2?season=17&division=A
     * or without filters
     * https://www.heroesprofile.com/Esports/NGS/Team2+2
     */

    https: if (this.util.isNullOrEmpty(teamName)) {
      return "";
    } else {
      teamName = encodeURIComponent(teamName);
      return `${environment.heroesProfileTeam}/${teamName}`;
    }
  }

  getNgsHpPlayerLink(toonHandle, displayName){
    /**
     * https://www.heroesprofile.com/Esports/NGS/Player/Zemill/67280
     */
    if (this.util.isNullOrEmpty(toonHandle)) {
      return "";
    } else {
      //1-Hero-1-848842
      let splitToonHandle = toonHandle.split("-");
      let blizz_id = splitToonHandle[3];
      let splitName = displayName.split("#");
      let battletag = splitName[0];
      return (
        `${environment.heroesProfilePlayer}/${battletag}/${blizz_id}`
      );
    }
  }

  public getHPProfileLinkStream: Subject<string> = new Subject();

getHPProfileLink(toonHandle, displayName) {
  let returnUrl = "";
  /**
   * https://www.heroesprofile.com/PlayerZemill/67280/1
   */

  if (this.util.isNullOrEmpty(toonHandle)) {
    this.http
      .httpGet("user/hero-profile/path", [
        { displayName: encodeURIComponent(displayName) },
      ])
      .subscribe((res) => {
        if (res) {
          let blizz_id = res.blizz_id;
          let region = res.region;
          let splitName = displayName.split("#");
          let battletag = splitName[0];
          returnUrl = `${environment.heroesProfile}/${battletag}/${blizz_id}/${region}`;
          this.getHPProfileLinkStream.next(returnUrl);
        } else {
          this.getHPProfileLinkStream.next(null);
        }
      });
  } else {
    //1-Hero-1-848842
    let splitToonHandle = toonHandle.split("-");
    let region = splitToonHandle[2];
    let blizz_id = splitToonHandle[3];
    let splitName = displayName.split("#");
    let battletag = splitName[0];
    returnUrl = `${environment.heroesProfile}/${battletag}/${blizz_id}/${region}`;
    this.getHPProfileLinkStream.next(returnUrl);
  }
}

}
