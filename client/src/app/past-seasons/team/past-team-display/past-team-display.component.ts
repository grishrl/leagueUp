import { Component, OnInit, Input } from '@angular/core';
import { Team } from '../../../classes/team.class';
import { TeamService } from '../../../services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-past-team-display',
  templateUrl: './team-display.component.html',
  styleUrls: ['./team-display.component.css']
})
export class PastTeamDisplayComponent implements OnInit {
  _teams: Team[] = [];
  MemberRows: Array<any> = [];

  @Input() perColumn:any
  @Input() set teams(teams:Team[]){
    if(teams != null && teams != undefined){
      this.initTeam(teams);
      // this.createMyDisplay();
    }else{

      this._teams = [];
      this.rows = [];
    }
  }

  get teams():Team[]{
    return this._teams;
  }

  initTeam(val){
    // if (val && val.length > 0) {
    //   this.team.getTeams(val).subscribe((retn) => {
    //     retn = this.util.sortTeams(retn);
    //     this._teams = retn;
    //   }, (error) => {
    //     console.log(error);
    //   });
    // }else{
    //   this._teams = [];
    // }
  }

  teamImage(img){
    if(img == null || img == undefined){
      return this.team.imageFQDN('defaultTeamLogo.png');
    }else{
      return this.team.imageFQDN(img);
    }
  }

  rows: Array<any> = [];

  constructor(public team:TeamService, private util:UtilitiesService) { }

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
