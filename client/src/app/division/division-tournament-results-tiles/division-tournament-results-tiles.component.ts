import { Component, OnInit, Input } from '@angular/core';
import { StandingsService } from 'src/app/services/standings.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-division-tournament-results-tiles',
  templateUrl: './division-tournament-results-tiles.component.html',
  styleUrls: ['./division-tournament-results-tiles.component.css']
})
export class DivisionTournamentResultsTilesComponent implements OnInit {


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
        console.log(err);
      });
    }
  }

  matches: any[] = [];
  selectedDivision: any
  rounds: number[] = [];

  selectedRound: number
  displayMatches : Map<string,[object]>;
  getMatches() {
    this.displayMatches = new Map<string, [object]>();
    let matches = this.localStoreTournaments[this.selectedCup].matches;

    if(matches.length>0){
      this.scheduleService.getMatchList(matches).subscribe(
        res => {
          this.matches = res;
          this.matches = this.matches.filter(match => {
            return match.reported;
          });
          this.matches.sort((a,b)=>{
            if(a.round>b.round){
              return 1;
            }else{
              return -1;
            }
          });
          this.matches.forEach(match=>{
            if (match.scheduledTime) {
              if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
                match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
              }
            }
            if(this.displayMatches.has(match.round)){
              let temp = this.displayMatches.get(match.round);
              temp.push(match);
              this.displayMatches.set(match.round, temp);
            }else{
              this.displayMatches.set(match.round, [match]);
            }
          });

        },
        err => { console.log(err) }
      )
    }


  }

}
