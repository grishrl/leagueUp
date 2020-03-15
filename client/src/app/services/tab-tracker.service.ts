import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TabTrackerService {

  constructor() { }

  lastRoute;
  lastTab;

  returnTabIndexIfSameRoute(thisRoute){
    if(this.lastRoute == thisRoute){
      return this.lastTab;
    }else{
      return 0;
    }
  }

}
