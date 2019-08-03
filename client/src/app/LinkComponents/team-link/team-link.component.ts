import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-link',
  templateUrl: './team-link.component.html',
  styleUrls: ['./team-link.component.css']
})
export class TeamLinkComponent implements OnInit {

  constructor(private teamService: TeamService) {

   }

  routeFriendlyName;

  ngOnInit() {

  }

  teamVal:string
  @Input() set team(val){
    if(val){
      this.teamVal = val;
      this.routeFriendlyName = this.teamService.routeFriendlyTeamName(this.teamVal);
    }
  }

}
