import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

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
    this.scheduleService.getTeamSchedules(6, teamName).subscribe(
      res => {
        let matches = res;
        console.log(res);
        //set the nomatches state
        if (matches.length == 0) {
          this.noMatches = true;
        } else {
          this.noMatches = false;
          let div = matches[0].divisionConcat
          this.standingsService.getStandings(div).subscribe(
            res => {
              let standings = res;
              matches.forEach(match => {
                standings.forEach(standing => {
                  if (match.home.teamName == standing.teamName) {
                    match.home['losses'] = standing.losses;
                    match.home['wins'] = standing.wins;
                  }
                  if (match.away.teamName == standing.teamName) {
                    match.away['losses'] = standing.losses;
                    match.away['wins'] = standing.wins;
                  }
                });
                if (match.scheduleDeadline) {
                  match['friendlyDeadline'] = this.util.getDateFromMS(match.scheduleDeadline);
                }

                if (match.scheduledTime) {
                  match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                  match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                  match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
                }
              })
            }, err => {
              console.log(err);
            });
          this.matches = matches;
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
