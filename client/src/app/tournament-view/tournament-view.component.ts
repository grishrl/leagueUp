import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { TeamService } from '../services/team.service';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent implements OnInit {
  // _iScroll:iScroll;
  _bracket;

  noBracket=true;

  constructor(private scheduleService:ScheduleService, public _team:TeamService, private util: UtilitiesService) {
    
   }
   x:any;
   y:any;

   _division;
   @Input() set division(_division){
     if(!this.util.isNullOrEmpty(_division)){
       this._division = _division;
     }
   }

   _season;
   @Input() set season(_season){
     if(!this.util.isNullOrEmpty(_season)){
       this._season = _season;
     }
   }

   _name;
   @Input() set name(_name){
     if(!this.util.isNullOrEmpty(_name)){
       this._name = _name;
       this.ngOnInit();
     }
   }
   
  
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
    this.getTournamentBrackets();
  }

  ngOnChanges(){
    this.getTournamentBrackets();
  }

  private getTournamentBrackets() {
    console.log(this._name, this._season, this._division);
    if (this.util.isNullOrEmpty(this._name) && this.util.isNullOrEmpty(this._season) && this.util.isNullOrEmpty(this._division)) {
      console.warn('Tournament view must be provided input');
      this.noBracket = false;
    } else {
      this.scheduleService.getTournamentGames(this._name, this._season, this._division).subscribe(res => {
        this.noBracket = true;
        this.matches = res['tournMatches'];
        this.tournamentObject = this.arrangeMatches();
      }, err => {
        this.noBracket = false;
      });
    }
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

  ngAfterViewInit(){

  }

}
