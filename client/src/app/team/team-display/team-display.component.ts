import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../classes/team.class';
import { TeamService } from '../../services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { HistoryService } from 'src/app/services/history.service';

@Component({
  selector: 'app-team-display',
  templateUrl: './team-display.component.html',
  styleUrls: ['./team-display.component.css']
})
export class TeamDisplayComponent implements OnInit {
  _teams: Team[] = [];
  MemberRows: Array<any> = [];

  _teamList;
  @Input() set teams(teams:Team[]){
    if(teams != null && teams != undefined){
      this._teamList = teams;
      this.initComponent();
    }else{
      this._teams = [];
      this.rows = [];
    }
  }

  get teams():Team[]{
    return this._teams;
  }

  _season
  _pastSeason

  @Input() set teamObj(val){
    console.log('team obj ', val);
    if(!this.util.isNullOrEmpty(val)){
      this._teamList = val.teams;
      this._season = val.season;
      this._pastSeason = val.pastSeason;
      this.initComponent();
    }
  }

  initComponent(){
    //blank out display array
    this._teams=[];

    if (this._pastSeason){
      this.history.getPastTeamsViaSeason(this._teamList, this._season).subscribe(
        res => {
          res.forEach(element => {
            this._teams.push(element.object);
          });
          this._teams = this.util.sortTeams(this._teams);
        },
        err => {
          console.log(err);
        }
      )
    }else{
      this.team.getTeams(this._teamList).subscribe((retn) => {
        retn = this.util.sortTeams(retn);
        this._teams = retn;
      }, (error) => {
        console.log(error);
      });
    }
  }

  teamImage(img){
    if(img == null || img == undefined){
      return this.team.imageFQDN('defaultTeamLogo.png');
    }else{
      return this.team.imageFQDN(img);
    }
  }

  rows: Array<any> = [];

  constructor(public team:TeamService, private util:UtilitiesService, private history:HistoryService) { }

  // createMyDisplay(){
  //   if(!this.perColumn){
  //     this.perColumn = 3;
  //   }
  //   this.rows = [];
  //   if (this._teams != undefined && this._teams.length > 0) {
  //     if (this._teams.length > this.perColumn) {
  //       let temparr = [];
  //       for (var i = 0; i < this._teams.length; i++) {
  //         if (i>0 && i % this.perColumn == 0) {
  //           this.rows.push(temparr);
  //           temparr = [];
  //         }
  //         temparr.push(this._teams[i]);
  //         //if this is the last element add the row to the display
  //         if(i == ((this._teams.length-1))){
  //           if(temparr.length>0){
  //             this.rows.push(temparr);
  //           }
  //         }
  //       }
  //     } else {
  //       this.rows.push(this._teams);
  //     }
  //   } else {
  //     this.rows = [];
  //   }
  // }

  ngOnInit() {

  }

}
