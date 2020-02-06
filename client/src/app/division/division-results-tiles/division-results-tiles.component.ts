import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DivisionService } from 'src/app/services/division.service';
import { StandingsService } from 'src/app/services/standings.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-division-results-tiles',
  templateUrl: './division-results-tiles.component.html',
  styleUrls: ['./division-results-tiles.component.css']
})
export class DivisionResultsTilesComponent implements OnInit {

  constructor(private divisionService: DivisionService, private standingsService: StandingsService,
    private scheduleService: ScheduleService, public team: TeamService, public util: UtilitiesService,
    private timeService:TimeserviceService) {

     }
     currentSeason;
  divisions: any = [];
  standings: any[] = [];



  provDiv

  @Input() set division(div) {
    if (div != undefined && div != null) {
      this.provDiv = div;

    }
  }

  pastSeason=false;


@Input() set divObj(div) {
  if (div != undefined && div != null) {
    this.provDiv = div.division;
    this.currentSeason = div.season;
    this.pastSeason = div.pastSeason;

  }
}

seasonVal
  @Input() set season(val) {
    if (val != undefined && val != null) {
      this.seasonVal = val;
    }
  }

  ngOnInit() {
    if (this.seasonVal) {
      this.currentSeason = this.seasonVal;
      this.rounds = this.util.calculateRounds(this.provDiv);
    } else {
      this.timeService.getSesasonInfo().subscribe(
        res => {
          this.currentSeason = res['value'];
          this.rounds = this.util.calculateRounds(this.provDiv);
        }
      );
    }
  }



  matches: any[] = [];
  selectedDivision: any
  rounds: number[] = [];

  selectedRound: number
  getMatches() {
    this.matches = [];
    let div;
    if (this.provDiv != undefined && this.provDiv != null) {
      div = this.provDiv.divisionConcat;
    } else {
      div = this.selectedDivision.divisionConcat;
    }

    let season = this.currentSeason;
    this.scheduleService.getScheduleMatches(season, div, this.selectedRound).subscribe(
      res => {
        this.matches = res;
        this.matches = this.matches.filter( match=>{
          return match.reported;
        })
        if(this.seasonVal){
          this.standingsService.getPastStandings(this.provDiv.divisionConcat, this.currentSeason).subscribe(
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
                  console.log(err);
                }
              )
            });
        }else{
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
                  console.log(err);
                }
              )
            });
        }

      },
      err => { console.log(err) }
    )
  }
}
