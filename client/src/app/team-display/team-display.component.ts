import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../classes/team.class';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-team-display',
  templateUrl: './team-display.component.html',
  styleUrls: ['./team-display.component.css']
})
export class TeamDisplayComponent implements OnInit {
  _teams: Team[] = [];
  MemberRows: Array<any> = [];

  @Input() perColumn:any
  @Input() set teams(teams:Team[]){
    if(teams != null && teams != undefined){
      this._teams = teams;
      this.createMyDisplay();
    }else{
      this._teams = [];
      this.rows = [];
    }
  }

  get teams():Team[]{
    return this._teams;
  }

  teamImage(img){
    console.log('img ', img);
    if(img == null || img == undefined){
      return this.team.imageFQDN('defaultTeamLogo.png');
    }else{
      return this.team.imageFQDN(img);
    }
  }

  rows: Array<any> = [];

  constructor(private team:TeamService) { }

  createMyDisplay(){
    if(!this.perColumn){
      this.perColumn = 3;
    }
    this.rows = [];
    if (this._teams != undefined && this._teams.length > 0) {
      if (this._teams.length > this.perColumn) {
        let temparr = [];
        for (var i = 0; i < this._teams.length; i++) {
          if (i>0 && i % this.perColumn == 0) {
            this.rows.push(temparr);
            temparr = [];
          }else if(i == this._teams.length-1){
            if(temparr.length>0){
              this.rows.push(temparr);
            }
          }
          temparr.push(this._teams[i]);
        }
      } else {
        this.rows.push(this._teams);
      }
    } else {
      this.rows = [];
    }
  }

  ngOnInit() {
    
  }

}
