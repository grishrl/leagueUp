import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';

@Component({
  selector: 'app-team-schedule-table',
  templateUrl: './team-schedule-table.component.html',
  styleUrls: ['./team-schedule-table.component.css']
})
export class TeamScheduleTableComponent implements OnInit {

  constructor(public teamServ:TeamService, private scheduleService:ScheduleService, public util:UtilitiesService, private standingsService:StandingsService) { }

  noMatches;
  rounds;
  roundsArray;
  matches;
  initTeamSchedule(teamName){
    this.scheduleService.getTeamSchedules(6, teamName).subscribe(
      res => {
        let matches = res;
        //set the nomatches state
        if (matches.length == 0) {
          this.noMatches = true;
        } else {
          this.noMatches = false;
        }

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
        //build out the rounds object:
        /*
        rounds = {
          'roundNubmer':[
                          {matchObject},
                          {matchObject}
                        ]
                      }
        */
        // let roundsArray = [];
        // if (matches.length % 2 == 0) {
        //   for (var i = 0; i <= matches.length; i++) {
        //     if (this.rounds == null || this.rounds == undefined) {
        //       this.rounds = {};
        //     }

        //     let realRoundNumber = i + 1;
        //     roundsArray.push(realRoundNumber);
        //     matches.forEach(match => {
        //       if (this.rounds[realRoundNumber] == null || this.rounds[realRoundNumber] == undefined) {
        //         this.rounds[realRoundNumber] = [];
        //       }
        //       if (match.round == realRoundNumber) {
        //         // roundsArray.push(realRoundNumber);
        //         this.rounds[realRoundNumber].push(match);
        //       }

        //     });
        //   }
        // } else if (matches.length % 2 != 0) {
        //   for (var i = 0; i < matches.length; i++) {
        //     if (this.rounds == null || this.rounds == undefined) {
        //       this.rounds = {};
        //     }
        //     let realRoundNumber = i + 1;
        //     roundsArray.push(realRoundNumber);
        //     matches.forEach(match => {
        //       if (this.rounds[realRoundNumber] == null || this.rounds[realRoundNumber] == undefined) {
        //         this.rounds[realRoundNumber] = [];
        //       }
        //       if (match.round == realRoundNumber) {
        //         this.rounds[realRoundNumber].push(match);
        //       }

        //     });
        //   }
        // }



        // this.rounds;
        // this.roundsArray = roundsArray;

        // console.log(this.rounds);
        // console.log(this.roundsArray);
      },
      err => { console.log(err) }
    )
  }

  @Input() set team(val){
    if(val){
      this.initTeamSchedule(val)
    }
  }

  ngOnInit() {
  }

}
