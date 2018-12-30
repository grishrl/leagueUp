import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../classes/team.class';

@Component({
  selector: 'app-team-quick-view',
  templateUrl: './team-quick-view.component.html',
  styleUrls: ['./team-quick-view.component.css']
})
export class TeamQuickViewComponent implements OnInit {
  _teamName: string
  @Input() set teamName(team){
    // console.log('set teamName ',team)
    if(team!=undefined&&team!=null){
      this.disTeam = team;
    }
  }

  disTeam = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  constructor(private team : TeamService) { }

  ngOnInit() {
    // if(this._teamName!=null&&this._teamName!=undefined){
    //   console.log('calling?')
    //   this.team.getTeam(this._teamName).subscribe(res=>{
    //     this.disTeam = res;
    //     console.log(this.disTeam);
    //   });
    // }
  }

}
