import { Injectable } from '@angular/core';
import { UtilitiesService } from './utilities.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HotsProfileService {

  constructor(private util:UtilitiesService) { }

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

  getHPProfileLink(toonHandle, displayName) {
    //https://www.heroesprofile.com/Profile/?blizz_id=7905329&battletag=wraithling&region=1
    if (this.util.isNullOrEmpty(toonHandle)) {
      return '';
    } else {
      //1-Hero-1-848842
      let splitToonHandle = toonHandle.split('-');
      let region = splitToonHandle[2];
      let blizz_id = splitToonHandle[3];
      let splitName = displayName.split('#');
      let battletag = splitName[0];
      return environment.heroesProfile + 'region=' + region + '&blizz_id=' + blizz_id + '&battletag=' + battletag;
    }
  }
}
