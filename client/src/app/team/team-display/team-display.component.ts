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

  @Input() set season(val) {
    if (val) {
      this._season = val;
      this.initComponent();
    }
  }

  initComponent(){

    //blank out display array
    this._teams=[];
    if (this._season){
      this.history.getPastTeamsViaSeason(this._teamList, this._season).subscribe(
        res => {
          this._teams = [];

          res.forEach(element => {
            this._teams.push(element.object);
          });
          this._teams = this.util.sortTeams(this._teams);
          this.getLogos();
        },
        err => {

        }
      )
    }else{
      this.team.getTeams(this._teamList).subscribe((retn) => {
        this._teams = [];
        retn = this.util.sortTeams(retn);
        this._teams = retn;
        this.getLogos();
      }, (error) => {
        console.warn(error);
      });
    }
  }

  getLogos(){
    this._teams.forEach(
      team=>{
        team.logo = this.team.imageFQDN(team.logo, this._season);
      }
    )
  }

  rows: Array<any> = [];

  constructor(public team:TeamService, private util:UtilitiesService, private history:HistoryService) {
    this._teams = [];
   }

  ngOnInit() {

    this.initComponent();

  }

}
