import { Injectable } from '@angular/core';
import { UtilitiesService } from './utilities.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor( private util:UtilitiesService) { }

  arrangeDivisions = (a, b) => {
    if (a.sorting < b.sorting) {
      return -1;
    }
    if (a.sorting > b.sorting) {
      return 1
    }
    return 0;
  };

  sortMatchesBySeason(matches){

      return matches.sort( (a,b)=>{
        if(a.season<b.season){
          return 1;
        }else{
          return -1;
        }
      })

  }

  testName(unit, teamFlt) {
    let bool = false;

    let awayName = this.util.returnBoolByPath(unit, 'away.teamName') ? unit.away.teamName : '';
    let homeName = this.util.returnBoolByPath(unit, 'home.teamName') ? unit.home.teamName : '';
    awayName = awayName.toLowerCase();
    homeName = homeName.toLowerCase();
    let flt = teamFlt.toLowerCase();
    if (awayName.indexOf(flt) > -1 || homeName.indexOf(flt) > -1) {
      bool = true;
    }
    else {
      bool = false;
    }

    return bool;
  }

  testDivision(unit, flt) {
    return unit.divisionConcat == flt.divisionConcat;
  }

  testRound(unit, flt){
    return unit.round == flt;
  }

  testScheduled(unit){
    return this.util.returnBoolByPath(unit, 'scheduledTime.startTime');
  }

  testTournament(unit){
    let bool = false;
      if (unit.type && unit.type == 'tournament') {
        bool = true;
      }
      return bool;
  }

  testTime(unit, start, end){
    let bool=false;
    if (this.util.returnBoolByPath(unit, 'scheduledTime.startTime')) {
      if (unit.scheduledTime.startTime >= start){
        if (this.util.isNullOrEmpty(end)) {
          bool=true;
        } else {
          if(unit.scheduledTime.startTime <= end){
            bool = true;
          }else{
            bool=false;
          }
        }
      }else{
        bool=false;
      }
    }else{
      bool=false;
    }
    return bool
  }


}
