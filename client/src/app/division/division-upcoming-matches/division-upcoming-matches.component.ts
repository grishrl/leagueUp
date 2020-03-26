import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-division-upcoming-matches',
  templateUrl: './division-upcoming-matches.component.html',
  styleUrls: ['./division-upcoming-matches.component.css']
})
export class DivisionUpcomingMatchesComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public teamServ:TeamService) { }

  @Input() set division(val){
    if(val){
      this.initSched(val);
    }
  }

  next4matches=[];
  initSched(filter){
    this.scheduleService.getAllMatchesWithStartTime().subscribe(
      res => {
        this.next4matches = [];
        let matches = res;
        let now = Date.now();

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
        matches = matches.filter(
          match => {
            return match.divisionConcat == filter
          }
        )
        matches = matches.sort((a, b) => {
          if (a.scheduledTime.startTime > b.scheduledTime.startTime) {
            return 1;
          } else {
            return -1;
          }
        });
        matches.forEach((match, ind) => {
          if (ind < 4) {
            match.home.logo = this.teamServ.imageFQDN(match.home.logo);
            match.away.logo = this.teamServ.imageFQDN(match.away.logo);
            this.next4matches.push(match);
          }
        });
      },
      err => { }
    )
  }

  ngOnInit() {

  }

}
