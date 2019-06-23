import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-team-schedule-table',
  templateUrl: './team-schedule-table.component.html',
  styleUrls: ['./team-schedule-table.component.css']
})
export class TeamScheduleTableComponent implements OnInit {

  constructor(public teamServ:TeamService, private scheduleService:ScheduleService, public util:UtilitiesService, private standingsService:StandingsService, private Auth:AuthService, private router:Router) { }

  noMatches;
  rounds;
  roundsArray;
  matches;
  initTeamSchedule(teamName){
    this.scheduleService.getTeamSchedules(environment.season, teamName).subscribe(
      res => {
        let matches = res;
        console.log(res);
        //set the nomatches state
        console.log(matches);
        if (matches.length == 0) {
          this.noMatches = true;
        } else {

          this.noMatches = false;

          matches.forEach(match => {
                if (match.scheduleDeadline) {
                  match['friendlyDeadline'] = this.util.getDateFromMS(match.scheduleDeadline);
                }

                if (match.scheduledTime) {
                  match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                  match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                  match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
                }

        });
        matches =  matches.sort((a,b)=>{
          if(a.round>b.round){
            return 1;
          }else{
            return -1;
          }
        });
          this.matches = matches;
        console.log('nomatches ', this.noMatches);



      }
    },
      err => { console.log(err) }
    )
  }

  checkDate(match) {

    let ret = false;
    if (match['scheduleDeadline']) {
      let intDate = parseInt(match['scheduleDeadline']);
      let weekAgo = intDate - 604800000;
      if (this.todayDate > weekAgo) {
        ret = true;
      }
    }
    return ret;
  }

  teamObj;
  @Input() set team(val){
    if(val){
      this.teamObj = val;
      this.initTeamSchedule(val.teamName)
    }
  }

  userCanSchedule() {
    if (this.teamObj.teamName == this.Auth.getTeam() && this.Auth.getCaptain() != 'false') {
      return true;
    } else {
      return false;
    }
  }

  todayDate;
  ngOnInit() {
    this.todayDate = new Date().getTime();
  }

  scheduleMatch(id) {
    this.router.navigate(['schedule/scheduleMatch', id]);
  }

}
