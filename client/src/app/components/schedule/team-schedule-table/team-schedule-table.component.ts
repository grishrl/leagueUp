import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { TimeService } from 'src/app/services/time.service';

@Component({
  selector: 'app-team-schedule-table',
  templateUrl: './team-schedule-table.component.html',
  styleUrls: ['./team-schedule-table.component.css']
})
export class TeamScheduleTableComponent implements OnInit, OnChanges {

  currentSeason;
  constructor(public teamServ:TeamService, private scheduleService:ScheduleService,
    public util:UtilitiesService, private standingsService:StandingsService, private Auth:AuthService,
    private router:Router, private timeService:TimeService) {
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
            err => { console.warn(err) }
          )
        }
    )

  }

  teamNameVal;
  @Input() set teamName(val){
    if(val){
      this.teamNameVal = val;
    }
  }

  seasonVal;
  @Input() set season(val) {
    if (val) {
      this.seasonVal = val;
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
      err => { console.warn(err) }
    )
  }


  userCanSchedule() {
    if (this.teamNameVal == this.Auth.getTeam() && this.Auth.getCaptain() != 'false') {
      return true;
    } else {
      return false;
    }
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes.season && changes.season.currentValue){
      if(this.teamName){
        this.initWithSeason();
      }
    }
    if(changes.teamName.currentValue){
      if(this.seasonVal){
         this.initWithSeason();
      }else{
        this.initTeamSchedule(this.teamNameVal);
      }
    }
  }


  ngOnInit() {
  }

}
