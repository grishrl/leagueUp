import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { StandingsService } from 'src/app/services/standings.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-schedule-view',
  templateUrl: './schedule-view.component.html',
  styleUrls: ['./schedule-view.component.css']
})
export class ScheduleViewComponent implements OnInit, OnChanges {

  constructor( private standingsService:StandingsService,
    private scheduleService: ScheduleService, public team: TeamService, public util:UtilitiesService,
    private timeService:TimeserviceService) {
  }
  divisions:any=[];
  standings:any[]=[];
  seasonVal;
  currentSeason

  ngOnInit() {
    this.initialize();
}

  private initialize() {
    if (this.seasonVal) {
      this.selectedRound = 1;
      this.getMatches();
    }
    else {
      this.timeService.getSesasonInfo().subscribe(res => {
        this.currentSeason = res['value'];
        let week = this.timeService.returnWeekNumber();
        if (week > 0) {
          this.selectedRound = week;
          this.getMatches();
        }
      });
    }
  }

  provDiv
  provSeason
  pastSeason
  @Input() set divObj(val){
    if(!this.util.isNullOrEmpty(val)){
      this.provDiv = val.division;
      this.provSeason = val.season;
      this.pastSeason = val.pastSeason;
      this.rounds = this.util.calculateRounds(this.provDiv);
      // this.initialize();
    }
  }

  @Input() set season(val){
    this.seasonVal = val;
    // this.initialize();
  }

  @Input() set division(div){
    if(div!=undefined && div != null){
      this.provDiv = div;
      // this.initialize();
    }
  }

  matches:any[]=[];
  selectedDivision:any
  rounds: number[] = [];


  selectedRound:number

  getMatches(){

    let div;
    if(this.provDiv!=undefined&&this.provDiv!=null){
      div=this.provDiv.divisionConcat;
    }else{
      div = this.selectedDivision.divisionConcat;
    }
      let season = this.seasonVal ? this.seasonVal : this.currentSeason;
      this.scheduleService.getScheduleMatches(season, div, this.selectedRound).subscribe(
        res => {

          this.matches = res;
          this.standingsService.getStandings(this.provDiv.divisionConcat).subscribe(
            res => {
              this.standings = res;
              this.matches.forEach(match => {
                this.standings.forEach(standing => {
                  if (match.home.teamName == standing.teamName) {
                    match.home['losses'] = standing.losses;
                    match.home['wins'] = standing.wins;
                  }
                  if (match.away.teamName == standing.teamName) {
                    match.away['losses'] = standing.losses;
                    match.away['wins'] = standing.wins;
                  }
                });
                if (match.scheduledTime) {
                  if (match.scheduledTime.startTime != null || match.scheduledTime.startTime != undefined) {
                    match['friendlyDate'] = this.util.getDateFromMS(match.scheduledTime.startTime);
                    match['friendlyTime'] = this.util.getTimeFromMS(match.scheduledTime.startTime);
                    match['suffix'] = this.util.getSuffixFromMS(match.scheduledTime.startTime);
                  }
                }
              },
                err => {
                  console.warn(err);
                }
              )
            });
        },
        err => { console.warn(err) }
      )


  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.division) {
      if ((changes.division.currentValue && changes.division.currentValue['divisionConcat'] != null)) {
        if (changes.division.previousValue && changes.division.currentValue['divisionConcat'] != changes.division.previousValue['divisionConcat'] || !changes.division.previousValue) {
          this.provDiv = changes.division.currentValue;
          this.rounds = this.util.calculateRounds(this.provDiv);
          this.initialize();
        }
      }
    }

    //would season change?
    // if (changes.season) {
    //   if ((changes.season.currentValue && changes.season.currentValue != null)) {
    //     if (changes.season.previousValue && changes.season.currentValue != changes.season.previousValue || !changes.season.previousValue) {
    //       //do something
    //       this.seasonVal = changes.season.currentValue;
    //       this.initialize();
    //     }
    //   }
    // }

  }

}
