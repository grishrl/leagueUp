import { Component, OnInit, Input } from '@angular/core';
import { Division } from 'src/app/classes/division';
import { environment } from '../../../environments/environment';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-division-cup-schedule',
  templateUrl: './division-cup-schedule.component.html',
  styleUrls: ['./division-cup-schedule.component.css']
})
export class DivisionCupScheduleComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public team:TeamService) { }

  totalCups = 0;
  selectedCup;
  localStoreTournaments;
  matches;

  @Input() set division(val){
    if(val){
      this.scheduleService.getTournamentGames(null, 7, val.divisionConcat).subscribe(res => {
        console.log(res);
        if (res.tournInfo.length > 0) {
          this.selectedCup = 0;
          this.totalCups = res.tournInfo.length;
          this.localStoreTournaments = res.tournInfo;
          this.getMatches();
        }
      }, err => {
        console.log(err);
      });
    }
  };

  getMatches() {

    let matches = this.localStoreTournaments[this.selectedCup].matches;

    if (matches.length > 0) {
      this.scheduleService.getMatchList(matches).subscribe(
        res => {
          this.matches = res;
          this.matches.forEach(match => {
            if (match.scheduledTime) {
              if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
                match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
              }
            }
            if (!this.util.returnBoolByPath(match, 'home') && !this.util.returnBoolByPath(match, 'home.name')){
              match.home={
                teamName:"TBD"
              }
            }
            if (!this.util.returnBoolByPath(match, 'away') && !this.util.returnBoolByPath(match, 'away.name')) {
              match.away = {
                teamName: "TBD"
              }
            }
          });
          //TODO: REVISIT THIS FOR CUP
          // this.standingsService.getStandings(this.provDiv.divisionConcat).subscribe(
          //   res => {
          //     this.standings = res;
          //     this.matches.forEach(match => {
          //       this.standings.forEach(standing => {
          //         if (match.home.teamName == standing.teamName) {
          //           match.home['losses'] = standing.losses;
          //           match.home['wins'] = standing.wins;
          //         }
          //         if (match.away.teamName == standing.teamName) {
          //           match.away['losses'] = standing.losses;
          //           match.away['wins'] = standing.wins;
          //         }
          //       });
          //       if (match.scheduledTime) {
          //         if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
          //           match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
          //           match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
          //           match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
          //         }
          //       }
          //     },
          //       err => {
          //         console.log(err);
          //       }
          //     )
          //   });
        },
        err => { console.log(err) }
      )
    }


  }

  ngOnInit() {

  }

}
