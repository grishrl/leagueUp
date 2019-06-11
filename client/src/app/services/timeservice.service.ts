import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeserviceService {

  constructor() { }

  weekMS = 1000*60*60*24*7;

  returnWeekNumber(){
    let now = Date.now();
    let difference = now - environment.seasonStart;
    return Math.ceil(difference / this.weekMS);
  }

  returnSeasonStart(){
    return environment.seasonStart;
  }

}
