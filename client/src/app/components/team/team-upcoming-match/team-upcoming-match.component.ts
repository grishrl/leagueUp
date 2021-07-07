import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-team-upcoming-match',
  templateUrl: './team-upcoming-match.component.html',
  styleUrls: ['./team-upcoming-match.component.css']
})
export class TeamUpcomingMatchComponent implements OnInit {

  currentSeason;
  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public teamServ:TeamService, private timeService:TimeService) {
    this.timeService.getSesasonInfo().subscribe(
      res => {
        this.currentSeason = res['value'];
      }
    );
   }

  ngOnInit() {
  }

  next4matches = [];
  initTeamSched(id){
    this.next4matches = [];
    this.scheduleService.getTeamSchedules(this.currentSeason, id).subscribe(
      res => {
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

        this.next4matches.forEach(match=>{
          match.home.logo = this.teamServ.imageFQDN(match.home.logo);
          match.away.logo = this.teamServ.imageFQDN(match.away.logo);
        })
      },
      err=>{
        console.warn(err);
      });
  }

  @Input() set team(val){
    if(val){
      this.initTeamSched(val)
    }

  }

}
