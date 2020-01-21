import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-team-schedule-table',
  templateUrl: './team-schedule-table.component.html',
  styleUrls: ['./team-schedule-table.component.css']
})
export class TeamScheduleTableComponent implements OnInit {

  currentSeason;
  constructor(public teamServ:TeamService, private scheduleService:ScheduleService,
    public util:UtilitiesService, private standingsService:StandingsService, private Auth:AuthService,
    private router:Router, private timeService:TimeserviceService) {
    this.timeService.getSesasonInfo().subscribe(res => {
      this.currentSeason = res['value'];
    });;
    }

  noMatches;
  rounds;
  roundsArray;
  matches;

  initTeamSchedule(teamName){
    this.timeService.getSesasonInfo().subscribe(
        res => {
          this.currentSeason = res['value'];
          this.scheduleService.getTeamSchedules(this.currentSeason, teamName).subscribe(
            res => {
              let matches = res;
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
                matches = matches.sort((a, b) => {
                  if (a.round > b.round) {
                    return 1;
                  } else {
                    return -1;
                  }
                });
                this.matches = matches;
              }
            },
            err => { console.log(err) }
          )
        }
    )

  }

  teamNameVal;
  @Input() set teamName(val){
    if(val){
      this.teamNameVal = val;
      if(this.teamNameVal){
        this.ngOnInit()
      }
    }
  }

  seasonVal;
  @Input() set season(val) {
    if (val) {
      this.seasonVal = val;
      if (this.teamNameVal) {
        this.ngOnInit()
      }
    }
  }

  initWithSeason(){
    this.scheduleService.getTeamSchedules(this.seasonVal, this.teamNameVal).subscribe(
      res => {
        let matches = res;
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
          matches = matches.sort((a, b) => {
            if (a.round > b.round) {
              return 1;
            } else {
              return -1;
            }
          });
          this.matches = matches;
        }
      },
      err => { console.log(err) }
    )
  }


  userCanSchedule() {
    if (this.teamNameVal == this.Auth.getTeam() && this.Auth.getCaptain() != 'false') {
      return true;
    } else {
      return false;
    }
  }

  todayDate;
  ngOnInit() {
    if (this.seasonVal){
      this.initWithSeason();
    }else{
      this.initTeamSchedule(this.teamNameVal);
    }
    this.todayDate = new Date().getTime();
  }

}
