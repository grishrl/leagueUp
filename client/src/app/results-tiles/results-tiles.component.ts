import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DivisionService } from 'src/app/services/division.service';
import { StandingsService } from 'src/app/services/standings.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-results-tiles',
  templateUrl: './results-tiles.component.html',
  styleUrls: ['./results-tiles.component.css']
})
export class ResultsTilesComponent implements OnInit {

  constructor(private divisionService: DivisionService, private standingsService: StandingsService, private scheduleService: ScheduleService, public team: TeamService, public util: UtilitiesService) { }
  divisions: any = [];
  standings: any[] = [];

  ngOnInit() {
  }

  provMatches = [];

  @Input() set matches(val) {
    if (val != undefined && val != null) {
      this.provMatches = val;
    }
  }

  dominator(match, side){
        let ret =false;
    if(match.forfeit){
      let ret = false;
    }else{
      if(side == 'home'){
        if(match.home.score==2 && match.away.score == 0){
          ret = true;
        }
      }else{
        if (match.away.score == 2 && match.home.score == 0) {
          ret = true;
        }
      }
    }
    return ret;
  }

  reportScore(match, side){
    let ret;
    if(match.forfeit){
      if(match[side].score==0){
        ret = 'F';
      }else{
        ret = 0;
      }
    }else{
      ret = match[side].score;
    }
    return ret;
  }

  selectedDivision: any
  rounds: number[] = [];

  // calculateRounds(div) {
  //   this.provDiv = this.provDiv ? this.provDiv : div;
  //   let roundNumber = 0;
  //   if (this.provDiv != undefined && this.provDiv != null && this.provDiv.teams != undefined && this.provDiv.teams != null) {
  //     if (this.provDiv % 2 == 0) {
  //       roundNumber = this.provDiv.teams.length - 1;
  //     } else {
  //       roundNumber = this.provDiv.teams.length;
  //     }

  //   } else if (this.selectedDivision != null && this.selectedDivision != undefined && this.selectedDivision.teams != undefined && this.selectedDivision.teams != null) {
  //     roundNumber = this.selectedDivision.teams.length - 1;
  //   }
  //   this.rounds = [];
  //   this.matches = [];
  //   if (roundNumber == 0) {
  //     roundNumber = 1;
  //   }
  //   for (let i = 0; i < roundNumber; i++) {
  //     this.rounds.push(i + 1);
  //   }
  // }

  // selectedRound: number
  // getMatches() {
  //   let div;
  //   if (this.provDiv != undefined && this.provDiv != null) {
  //     div = this.provDiv.divisionConcat;
  //   } else {
  //     div = this.selectedDivision.divisionConcat;
  //   }

  //   let season = environment.season;
  //   this.scheduleService.getScheduleMatches(season, div, this.selectedRound).subscribe(
  //     res => {
  //       this.matches = res;
  //       this.matches = this.matches.filter( match=>{
  //         return match.reported;
  //       })
  //       this.standingsService.getStandings(this.provDiv.divisionConcat).subscribe(
  //         res => {
  //           this.standings = res;
  //           this.matches.forEach(match => {
  //             this.standings.forEach(standing => {
  //               if (match.home.teamName == standing.teamName) {
  //                 match.home['losses'] = standing.losses;
  //                 match.home['wins'] = standing.wins;
  //               }
  //               if (match.away.teamName == standing.teamName) {
  //                 match.away['losses'] = standing.losses;
  //                 match.away['wins'] = standing.wins;
  //               }
  //             });
  //             if (match.scheduledTime) {
  //               if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
  //                 match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
  //                 match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
  //                 match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
  //               }
  //             }
  //           },
  //             err => {
  //               console.log(err);
  //             }
  //           )
  //         });
  //     },
  //     err => { console.log(err) }
  //   )
  // }
}
