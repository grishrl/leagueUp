import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  getSeasonInfoULR = '/admin/getSeasonInfo';
  cacheCall;

  constructor(private httpService:HttpService) {
    this.cacheCall = this.httpService.httpGetShareable(this.getSeasonInfoULR,[]);
    this.init();
  }

  weekMS = 1000*60*60*24*7;
  //604800000

  returnWeekNumber(){
    if(this.localInfo){
      let now = Date.now();
      let difference = now - this.localInfo.seasonStartDate;
      let weeks = difference / this.weekMS;
      return Math.ceil(weeks);
    }else{
      return 0;
    }
  }

  //this is to be used as an external spur to action; if a component loses it's values it can call this method which will fire the next observable
  getSesasonInfo() {
   return this.cacheCall;
  }

  postInfo(obj){
    let url = "/admin/upsertSeasonInfo"
    return this.httpService.httpPost(url,obj,true);
  }

  getSpecificSeason(value){
    return this.httpService.httpGet(this.getSeasonInfoULR, [{season:value}], false);
  }

  localInfo = null;
  init() {
    this.cacheCall.subscribe(
      res=>{
        this.localInfo = res.data;
      }
    )
  }

}
