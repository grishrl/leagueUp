import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-results-tiles',
  templateUrl: './team-results-tiles.component.html',
  styleUrls: ['./team-results-tiles.component.css']
})
export class TeamResultsTilesComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public teamServ:TeamService) { }

  displayArray = [];
  getTeamMatches(teamName){
    this.scheduleService.getTeamSchedules(6, teamName).subscribe(
      res=>{
        if(res && res.length>0){

          res.forEach( match => {
            if(match.reported){
              this.displayArray.push(match);
            }
          })
        }
      },
      err=>{}
    )
  }

  reportScore(match, side) {
    let ret;
    if (match.forfeit) {
      if (match[side].score == 0) {
        ret = 'F';
      } else {
        ret = 0;
      }
    } else {
      ret = match[side].score;
    }
    return ret;
  }

  @Input() set team(val){
    console.log('do something');
    if(val){
      this.getTeamMatches(val);
    }
  }

  ngOnInit() {
  }

}
