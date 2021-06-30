import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { StandingsService } from 'src/app/services/standings.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-division-tournament-results-tiles',
  templateUrl: './division-tournament-results-tiles.component.html',
  styleUrls: ['./division-tournament-results-tiles.component.css']
})
export class DivisionTournamentResultsTilesComponent implements OnInit, OnChanges {


  constructor(private standingsService: StandingsService, private scheduleService: ScheduleService, private timeService:TimeserviceService, public team: TeamService, public util: UtilitiesService) { }
  divisions: any = [];
  standings: any[] = [];

  ngOnInit() {
  }

  ngOnChanges(changes:SimpleChanges){

    this.displayMatches = new Map<string, [object]>();

    if(changes.hasOwnProperty('division')){
      let currentDivConcat = changes.division.currentValue ? changes.division.currentValue['divisionConcat'] : null ;
      let previousDivConcat = changes.division.previousValue ? changes.division.previousValue['divisionConcat'] : null;
      if (currentDivConcat != null && currentDivConcat != previousDivConcat){
        this.initialise();
      }
    }
    if (changes.hasOwnProperty('season')) {
      let currentSea = changes.season.currentValue ? changes.season.currentValue : null;
      let previousSea = changes.season.previousValue ? changes.season.previousValue : null;
      if (currentSea != null && currentSea != previousSea) {
        this.initialise();
      }
    }
  }

  selectedCup;
  localStoreTournaments;


  divVal;
  @Input() set division(div) {

    this.divVal = div;

  }

  seasonVal;
  @Input() set season(val){

    this.seasonVal = val;

  }

  matches: any[] = [];
  selectedDivision: any
  rounds: number[] = [];

  getTournamentInfo(){
    this.scheduleService.getTournamentGames(null, this.seasonVal, this.divVal.divisionConcat).subscribe(res => {
      if (res.tournInfo.length > 0) {
        this.selectedCup = 0;
        this.localStoreTournaments = res.tournInfo;
        this.getMatches();
      }
    }, err => {
      console.log(err);
    });

  }

  initialise(){
    if (!this.seasonVal) {
      this.timeService.getSesasonInfo().subscribe(
        res => {
          this.seasonVal = res['value'];
          this.getTournamentInfo();
        }
      );
    }else{
      this.getTournamentInfo();
    }
  }

  selectedRound: number
  displayMatches = new Map<string, [object]>();
  getMatches() {
    let matches = this.localStoreTournaments[this.selectedCup].matches;

    if(matches.length>0){
      this.scheduleService.getMatchList(matches,this.seasonVal).subscribe(
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
