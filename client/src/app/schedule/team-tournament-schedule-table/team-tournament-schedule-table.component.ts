import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-team-tournament-schedule-table',
  templateUrl: './team-tournament-schedule-table.component.html',
  styleUrls: ['./team-tournament-schedule-table.component.css']
})
export class TeamTournamentScheduleTableComponent implements OnInit {


  constructor(public teamServ: TeamService, private scheduleService: ScheduleService, public util: UtilitiesService, private standingsService: StandingsService, private Auth: AuthService, private router: Router, private timeService:TimeserviceService) { }

  noMatches;
  rounds;
  roundsArray;
  matches = [];
  initTeamSchedule(teamId, providedSeason) {

    this.scheduleService.getTeamTournamentGames(providedSeason, teamId).subscribe(
          res => {
            let matches = res;
            //set the nomatches state
            if (matches.length == 0) {
              this.noMatches = true;
            } else {
              this.noMatches = false;
            }

            matches.forEach(match => {
              if (match.scheduleDeadline) {
                match['friendlyDeadline'] = this.util.getDateFromMS(match.scheduleDeadline);
              }

              if (match.scheduledTime) {
                match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
              }

              if (!this.util.returnBoolByPath(match, 'home') && !this.util.returnBoolByPath(match, 'home.name')) {
                match.home = {
                  teamName: "TBD"
                }
              }
              if (!this.util.returnBoolByPath(match, 'away') && !this.util.returnBoolByPath(match, 'away.name')) {
                match.away = {
                  teamName: "TBD"
                }
              }
            });

            // let div = matches[0].divisionConcat
            // this.standingsService.getStandings(div).subscribe(
            //   res => {
            //     let standings = res;
            //     matches.forEach(match => {
            //       standings.forEach(standing => {
            //         if (match.home.teamName == standing.teamName) {
            //           match.home['losses'] = standing.losses;
            //           match.home['wins'] = standing.wins;
            //         }
            //         if (match.away.teamName == standing.teamName) {
            //           match.away['losses'] = standing.losses;
            //           match.away['wins'] = standing.wins;
            //         }
            //       });
            //       if (match.scheduleDeadline) {
            //         match['friendlyDeadline'] = this.util.getDateFromMS(match.scheduleDeadline);
            //       }

            //       if (match.scheduledTime) {
            //         match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
            //         match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
            //         match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
            //       }
            //     })
            //   }, err => {
            //     console.log(err);
            //   });


            this.matches = matches;

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
  @Input() set team(val) {
    if (val) {
      this.teamObj = val;
      // this.initTeamSchedule(val._id);
    }
  }

  seasonVal;
  @Input() set season(val) {
    if (val) {
      this.seasonVal = val;
      // this.initTeamSchedule(val._id);
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
    console.log('this.teamObj', this.teamObj, ' seasonVal ', this.seasonVal)
    if(this.seasonVal){
      this.initTeamSchedule(this.teamObj._id, this.seasonVal);
    }else{
      this.timeService.getSesasonInfo().subscribe(
        res => {
          let currentSeason = res['value'];
          this.initTeamSchedule(this.teamObj._id, currentSeason);
        },
        err=>{

        })

    }
  }

  scheduleMatch(id) {
    this.router.navigate(['schedule/scheduleMatch', id]);
  }


}
