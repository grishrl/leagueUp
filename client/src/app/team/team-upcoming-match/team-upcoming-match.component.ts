import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-upcoming-match',
  templateUrl: './team-upcoming-match.component.html',
  styleUrls: ['./team-upcoming-match.component.css']
})
export class TeamUpcomingMatchComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public teamServ:TeamService) { }

  ngOnInit() {
  }

  next4matches = [];
  initTeamSched(id){
    this.scheduleService.getTeamSchedules(6, id).subscribe(
      res => {
        console.log(res);
        let now = Date.now();
        let matches = res;
        matches = matches.filter(a => {
          if (a.scheduledTime && a.scheduledTime.startTime) {
            a.scheduledTime.startTime = parseInt(a.scheduledTime.startTime);
          }
          if (a.scheduledTime && a.scheduledTime.startTime > now) {
            return true;
          } else {
            return false;
          }
        });
        matches = matches.sort((a, b) => {
          if (a.scheduledTime.startTime > b.scheduledTime.startTime) {
            return 1;
          } else {
            return -1;
          }
        });
        matches.forEach((match, ind) => {
          if (ind < 4) {
            this.next4matches.push(match);
          }
        });
      },
      err=>{
        console.log(err);
      });
  }

  @Input() set team(val){
    if(val){
      this.initTeamSched(val)
    }

  }

}
