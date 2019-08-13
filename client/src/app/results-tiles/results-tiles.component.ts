import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-results-tiles',
  templateUrl: './results-tiles.component.html',
  styleUrls: ['./results-tiles.component.css']
})
export class ResultsTilesComponent implements OnInit {

  constructor(public team: TeamService, public util: UtilitiesService) { }
  divisions: any = [];
  standings: any[] = [];

  ngOnInit() {
  }

  provMatches = [];

  seasonVal;
  @Input() set season(val){
    if(val){
      this.seasonVal = val;
    }
  }

  @Input() set matches(val) {
    this.provMatches = [];
    if (val != undefined && val != null) {
      this.provMatches = val;
    }
  }

  dominator(match, side){
        let ret =false;
    if(match.forfeit){
      let ret = false;
    }else{
      if(side == 'home'){
        if(match.home.score==2 && match.away.score == 0){
          ret = true;
        }
      }else{
        if (match.away.score == 2 && match.home.score == 0) {
          ret = true;
        }
      }
    }
    return ret;
  }

  // forfeit(match, side){
  //   let ret ='';
  //   if (match.forfeit) {
  //     if (match[side].score == 0) {
  //       ret = 'F';
  //     }
  //   }
  //   return ret;
  // }
  forfeit(match, side) {
    let ret = false;
    if (match.forfeit) {
      if (match[side].score == 0) {
        ret = true;
      }
    }
    return ret;
  }

  resultText(match){
    let ret = null;
    if(match.forfeit){
      ret = "Forfeit";
    } else if (match.home.score == 0 && match.away.score == 2 || match.home.score == 2 && match.away.score == 0 ){
      ret = 'Domination';
    }
    return ret;
  }

  /*
    reportScore(match, side){
    let ret;
    if(match.forfeit){
      if(match[side].score==0){
        ret = 'F';
      }else{
        ret = 2;
      }
    }else{
      ret = match[side].score;
    }
    return ret;
  }
  */

  reportScore(match, side){
    let ret;
    if(match.forfeit){
      if(match[side].score==0){
        ret = 0;
      }else{
        ret = 2;
      }
    }else{
      ret = match[side].score;
    }
    return ret;
  }

  selectedDivision: any
  rounds: number[] = [];

}
