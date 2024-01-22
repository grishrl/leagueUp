import { Component, OnInit, Input } from '@angular/core';
import { StandingsService } from 'src/app/services/standings.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-division-cup-results-tiles',
  templateUrl: './division-cup-results-tiles.component.html',
  styleUrls: ['./division-cup-results-tiles.component.css']
})
export class DivisionCupResultsTilesComponent implements OnInit {


  constructor(private standingsService: StandingsService, private scheduleService: ScheduleService, public team: TeamService, public util: UtilitiesService) { }
  divisions: any = [];
  standings: any[] = [];

  ngOnInit() {
  }

  provDiv

  selectedCup;
  localStoreTournaments;


  @Input() set division(div) {
    if (div != undefined && div != null) {
      this.provDiv=div;
      this.scheduleService.getTournamentGames(null, 7, div.divisionConcat).subscribe(res => {
        if (res.tournInfo.length > 0) {
          this.selectedCup = 0;
          this.localStoreTournaments = res.tournInfo;
          this.getMatches();
        }
      }, err => {
        console.warn(err);
      });
    }
  }

  matches: any[] = [];
  selectedDivision: any
  rounds: number[] = [];

  selectedRound: number
  getMatches() {

    let matches = this.localStoreTournaments[this.selectedCup].matches;

    if(matches.length>0){
      this.scheduleService.getMatchList(matches).subscribe(
        res => {
          this.matches = res;
          this.matches = this.matches.filter(match => {
            return match.reported;
          });
          this.matches.forEach(match=>{
            if (match.scheduledTime) {
              if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
                match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
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
        err => { console.warn(err) }
      )
    }


  }

}
