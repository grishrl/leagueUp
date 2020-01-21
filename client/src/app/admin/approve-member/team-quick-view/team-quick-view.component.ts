import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from '../../../services/team.service';
import { Team } from '../../../classes/team.class';

@Component({
  selector: 'app-team-quick-view',
  templateUrl: './team-quick-view.component.html',
  styleUrls: ['./team-quick-view.component.css']
})
export class TeamQuickViewComponent implements OnInit {
  //component properties
  _teamName: string
  disTeam = new Team(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

  //Input bindings
  @Input() set teamName(team){
    if(team!=undefined&&team!=null){
      this.disTeam = team;
    }
  }

  constructor(public team : TeamService) { }

  ngOnInit() {
  }

}
