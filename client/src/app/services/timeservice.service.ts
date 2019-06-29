import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpServiceService } from './http-service.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeserviceService {

  getSeasonInfoULR = '/admin/getSeasonInfo';
  cacheCall;

  constructor(private httpService:HttpServiceService) {
    console.log('constructing time service');
    this.cacheCall = this.httpService.httpGetShareable(this.getSeasonInfoULR,[]);
    this.init();
  }

  weekMS = 1000*60*60*24*7;

  returnWeekNumber(){
    if(this.localInfo){
      let now = Date.now();
      let difference = now - this.localInfo.data.seasonStartDate;
      // console.log('now ', now);
      // console.log('this.localInfo.seasonStartDate ', this.localInfo.data.seasonStartDate);
      // console.log('difference ',difference);
      return Math.ceil(difference / this.weekMS);
    }else{
      return 0;
    }
  }

  public getSesasonInfoStream: Subject<object> = new Subject();

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
    this.httpService.httpGet(this.getSeasonInfoULR, []).subscribe(
      res=>{
        this.localInfo = res;
      }
    )
  }

}
