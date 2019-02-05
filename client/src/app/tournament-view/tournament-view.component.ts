import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent implements OnInit {
  // _iScroll:iScroll;
  _bracket;
  constructor(private scheduleService:ScheduleService, public _team:TeamService) {
    
   }
   x:any;
   y:any;
  
  matches: any = [];
  tournamentObject:any={
    'championship':{},
    'semiFinalLeft':{},
    'semiFinalRight':{},
    'quarterFinal1':{},
    'quarterFinal2':{},
    'quarterFinal3':{},
    'quarterFinal4':{},
    "ro16_1":{},
    "ro16_2":{},
    "ro16_3":{},
    "ro16_4":{},
    "ro16_5":{},
    "ro16_6":{},
    "ro16_7":{},
    "ro16_8":{}
  }
  ngOnInit() {

    this.scheduleService.getTournamentGames('six man tournament', 1, null).subscribe(
      res=>{
        console.log(res);
        this.matches = res['tournMatches'];
        this.tournamentObject = this.arrangeMatches();
      },
      err=>{
        console.log('jkl; ',err);
      }
    )
  }

  winner(obj, pos){
    return false;
  }

  championship:any;
  arrangeMatches(){
    let obj = {};
    obj['championship'] = this.returnChampionship();
    obj['semiFinalLeft'] = this.returnMatchById(obj['championship'].idChildren[0]);
    obj['semiFinalRight'] = this.returnMatchById(obj['championship'].idChildren[1]);
    obj['quarterFinal1'] = this.returnMatchById(obj['semiFinalLeft'].idChildren[0]);
    obj['quarterFinal2'] = this.returnMatchById(obj['semiFinalLeft'].idChildren[1]);
    obj['quarterFinal3'] = this.returnMatchById(obj['semiFinalRight'].idChildren[0]);
    obj['quarterFinal4'] = this.returnMatchById(obj['semiFinalRight'].idChildren[1]);
    obj["ro16_1"] = this.returnMatchById(obj['quarterFinal1'].idChildren[0]);
    obj["ro16_2"] = this.returnMatchById(obj['quarterFinal1'].idChildren[1]);
    obj["ro16_3"] = this.returnMatchById(obj['quarterFinal2'].idChildren[0]);
    obj["ro16_4"] = this.returnMatchById(obj['quarterFinal2'].idChildren[1]);
    obj["ro16_5"] = this.returnMatchById(obj['quarterFinal3'].idChildren[0]);
    obj["ro16_6"] = this.returnMatchById(obj['quarterFinal3'].idChildren[1]);
    obj["ro16_7"] = this.returnMatchById(obj['quarterFinal4'].idChildren[0]);
    obj["ro16_8"] = this.returnMatchById(obj['quarterFinal4'].idChildren[1]);
    return obj;
  }

  returnChampionship() {
    let headMatch = {};
    this.matches.forEach(match => {
      if (!match.parentId) {
        headMatch = match;
      }
    });
    return this.returnMatchById(headMatch['idChildren'][0]);
    
  }

  buildTree(match){
    if(match['idChildren']){
      
    }
  }

  doThis(){

  }

  returnMatchById(matchID){
    let retMatch;
    this.matches.forEach(match=>{
      if(match.matchId == matchID){
        retMatch = match;
      }
    });
    return retMatch;
  }
  
  // test(e){
  //   if(e.pointerType=='mouse'){

  //   }else{
  //     console.log(e);
  //     if (this.x + e.deltaX < -430) {
  //       //do nothing
  //     } else if (this.x + e.deltaX > 450) {
  //       //do nothing
  //     } else {
  //       this.x = this.x + e.deltaX;
  //     }

  //     if (this.y + e.deltaY < -120) {
  //       this.y = -120;
  //     } else if (this.y + e.deltaY > 300){
  //       this.y = 300
  //     } else {
  //       this.y = this.y + e.deltaY
  //     }
  //   } 

  //   // elem.style.transform = "translateX(" + e.deltaX + "px)";
  // }

  ngAfterViewInit(){

  }

}
