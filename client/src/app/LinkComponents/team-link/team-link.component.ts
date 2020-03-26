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
    this.routerLinkVal = []
    this.routerLinkVal.push('/teamProfile/');
    this.routerLinkVal.push(this.routeFriendlyName);
    if(this.seasonVal){
      this.routerLinkVal.push(this.seasonVal);
    }
  }


  //'/teamProfile/', routeFriendlyName, seasonVal
  routerLinkVal = []

  targetVal;
  @Input() set target(val){
    this.targetVal = val ? val : '_self';
  }

  teamVal:string
  @Input() set team(val){
    if(val){
      // this.teamVal = val;
      this.routeFriendlyName = this.teamService.routeFriendlyTeamName(val);
      this.ngOnInit();
    }
  }

  seasonVal: string
  @Input() set season(val) {
    if (val) {
      this.seasonVal = val;
      this.ngOnInit();
    }
  }

}
