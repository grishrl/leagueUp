import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpServiceService } from './http-service.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeserviceService {

  constructor(private httpService:HttpServiceService) {
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
    //if we don't have cached response data to use we will fire the http request again.
    if (this.localInfo) {
      this.getSesasonInfoStream.next(this.localInfo);
    } else {
      //firing the http request one more time.
      this.init();
    }

  }
  localInfo = null;
  init() {
    let url = '/admin/getSeasonInfo';
    this.httpService.httpGet(url, []).subscribe(
      res=>{
        this.localInfo = res;
        this.getSesasonInfo();
      }
    )
  }

}
