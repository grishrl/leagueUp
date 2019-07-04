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
    this.routeFriendlyName=this.teamService.routeFriendlyTeamName(this.team);
  }

  @Input() team:string;

}
