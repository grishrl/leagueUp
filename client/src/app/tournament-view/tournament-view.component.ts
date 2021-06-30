import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { TeamService } from '../services/team.service';
import { UtilitiesService } from '../services/utilities.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tournament-view',
  templateUrl: './tournament-view.component.html',
  styleUrls: ['./tournament-view.component.css']
})
export class TournamentViewComponent implements OnInit {
  // _iScroll:iScroll;
  _bracket;

  hasBracket = true;

  constructor(private scheduleService: ScheduleService, public _team: TeamService, private util: UtilitiesService, private dialog: MatDialog) {
  }

  x: any;
  y: any;

  _division;
  @Input() set division(_division) {
    this._division = _division;
    //  if(!this.util.isNullOrEmpty(_division)){
    //    this._division = _division;
    this.ngOnInit();
    //  }
  }

  _season;
  @Input() set season(_season) {
    this._season = _season;
    //  if(!this.util.isNullOrEmpty(_season)){
    //    this._season = _season;
    this.ngOnInit();
    //  }
  }

  _name;
  @Input() set name(_name) {
    this._name = _name;
    //  if(!this.util.isNullOrEmpty(_name)){
    //    this._name = _name;
    //    this.ngOnInit();
    //  }else{
    //    this._name=
    //  }
  }

  matches: any = [];
  tournamentObject: any;
  ngOnInit() {
    this.matches = [];
    this.tournamentObject = this.returnMatchObject();
    this.getTournamentBrackets();
  }

  ngOnChanges() {
    this.getTournamentBrackets();
  }

  private getTournamentBrackets() {
    this.hasBracket = false;
    this.scheduleService.getTournamentGames(this._name, this._season, this._division).subscribe(res => {
      if (res['tournInfo'][0]['matches']) {
        this.matches = res['tournInfo'][0]['matches'];
        if (this.matches.length > 0) {
          this.scheduleService
            .getMatchList(this.matches, this._season)
            .subscribe(
              (res) => {
                this.matches = res;
                this.tournamentObject = this.arrangeMatches();
                this.hasBracket = true;
              },
              (err) => {
                console.warn(err);
              }
            );
        }
      }
    }, err => {
      this.hasBracket = false;
    });
    // }
  }

  winner(obj, pos) {
    if (this.util.returnBoolByPath(obj, 'home.score') && this.util.returnBoolByPath(obj, 'away.score')) {
      if (obj.home.score > obj.away.score) {
        return pos == 'home';
      } else {
        return pos == 'away';
      }
    } else {
      return false;
    }

  }

  championship: any;
  arrangeMatches() {
    let obj = {};
    obj['championship'] = this.returnChampionship();

    if (obj['championship'] && obj['championship'].idChildren[0]) {
      obj['semiFinalLeft'] = this.returnMatchById(obj['championship'].idChildren[0]);
    } else {
      obj['semiFinalLeft'] = undefined;
    }

    if (obj['championship'] && obj['championship'].idChildren[1]) {
      obj['semiFinalRight'] = this.returnMatchById(obj['championship'].idChildren[1]);
    } else {
      obj['semiFinalRight'] = undefined;
    }

    if (obj['semiFinalLeft'] && obj['semiFinalLeft'].idChildren[0]) {
      obj['quarterFinal1'] = this.returnMatchById(obj['semiFinalLeft'].idChildren[0]);
    } else {
      obj['quarterFinal1'] = undefined;
    }

    if (obj['semiFinalLeft'] && obj['semiFinalLeft'].idChildren[1]) {
      obj['quarterFinal2'] = this.returnMatchById(obj['semiFinalLeft'].idChildren[1]);
    } else {
      obj['quarterFinal2'] = undefined;
    }

    if (obj['semiFinalRight'] && obj['semiFinalRight'].idChildren[0]) {
      obj['quarterFinal3'] = this.returnMatchById(obj['semiFinalRight'].idChildren[0]);
    } else {
      obj['quarterFinal3'] = undefined;
    }

    if (obj['semiFinalRight'] && obj['semiFinalRight'].idChildren[1]) {
      obj['quarterFinal4'] = this.returnMatchById(obj['semiFinalRight'].idChildren[1]);
    } else {
      obj['quarterFinal4'] = undefined;
    }

    if (obj['quarterFinal1'] && obj['quarterFinal1'].idChildren[0]) {
      obj["ro16_1"] = this.returnMatchById(obj['quarterFinal1'].idChildren[0]);
    } else {
      obj["ro16_1"] = undefined;
    }

    if (obj['quarterFinal1'] && obj['quarterFinal1'].idChildren[1]) {
      obj["ro16_2"] = this.returnMatchById(obj['quarterFinal1'].idChildren[1]);
    } else {
      obj["ro16_2"] = undefined;
    }

    if (obj['quarterFinal2'] && obj['quarterFinal2'].idChildren[0]) {
      obj["ro16_3"] = this.returnMatchById(obj['quarterFinal2'].idChildren[0]);
    } else {
      obj["ro16_3"] = undefined;
    }

    if (obj['quarterFinal2'] && obj['quarterFinal2'].idChildren[1]) {
      obj["ro16_4"] = this.returnMatchById(obj['quarterFinal2'].idChildren[1]);
    } else {
      obj["ro16_4"] = undefined;
    }

    if (obj['quarterFinal3'] && obj['quarterFinal3'].idChildren[0]) {
      obj["ro16_5"] = this.returnMatchById(obj['quarterFinal3'].idChildren[0]);
    } else {
      obj["ro16_5"] = undefined;
    }

    if (obj['quarterFinal3'] && obj['quarterFinal3'].idChildren[1]) {
      obj["ro16_6"] = this.returnMatchById(obj['quarterFinal3'].idChildren[1]);
    } else {
      obj["ro16_6"] = undefined;
    }

    if (obj['quarterFinal4'] && obj['quarterFinal4'].idChildren[0]) {
      obj["ro16_7"] = this.returnMatchById(obj['quarterFinal4'].idChildren[0]);
    } else {
      obj["ro16_7"] = undefined;
    }

    if (obj['quarterFinal4'] && obj['quarterFinal4'].idChildren[1]) {
      obj["ro16_8"] = this.returnMatchById(obj['quarterFinal4'].idChildren[1]);
    } else {
      obj["ro16_8"] = undefined;
    }
    return obj;
  }

  returnChampionship() {
    let headMatch = {};
    this.matches.forEach(match => {
      if (!match.parentId) {
        headMatch = match;
      }
    });
    if (headMatch['idChildren']) {
      return this.returnMatchById(headMatch['idChildren'][0]);
    } else {
      return undefined;
    }


  }

  buildTree(match) {
    if (match['idChildren']) {

    }
  }

  doThis() {

  }

  returnMatchById(matchID) {
    let retMatch;
    this.matches.forEach(match => {
      if (match.matchId == matchID) {
        retMatch = match;
      }
    });
    return retMatch;
  }

  ngAfterViewInit() {

  }

  returnMatchObject() {
    return {
      'championship': {},
      'semiFinalLeft': {},
      'semiFinalRight': {},
      'quarterFinal1': {},
      'quarterFinal2': {},
      'quarterFinal3': {},
      'quarterFinal4': {},
      "ro16_1": {},
      "ro16_2": {},
      "ro16_3": {},
      "ro16_4": {},
      "ro16_5": {},
      "ro16_6": {},
      "ro16_7": {},
      "ro16_8": {}
    }
  }

}
