import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { StandingsService } from 'src/app/services/standings.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: 'app-division-tournament-schedule-table',
  templateUrl: './division-tournament-schedule-table.component.html',
  styleUrls: ['./division-tournament-schedule-table.component.css']
})
export class DivisionTournamentScheduleTableComponent implements OnInit, OnChanges {


  constructor(public teamServ: TeamService, private scheduleService: ScheduleService, public util: UtilitiesService, private standingsService: StandingsService, private Auth: AuthService, private router: Router, private timeService:TimeserviceService) { }

  noMatches;
  rounds;
  roundsArray;
  matches = [];
  initTeamSchedule(division, providedSeason) {

    this.scheduleService.getTournamentGames(null, providedSeason, division.divisionConcat).subscribe(
          res => {
            let matches = [];
            if(res.tournInfo.length>0){
              matches = res.tournInfo[0].matches;
            }

            //set the nomatches state
            if (matches.length == 0) {
              this.noMatches = true;
              this.matches = matches;
            } else {
              this.noMatches = false;
            }

            this.scheduleService.getMatchList(matches, providedSeason).subscribe(
              res=>{
                let returnedMatches = res;
                returnedMatches.sort((a,b)=>{
                  if(a.round>b.round){
                    return 1;
                  }else{
                    return -1;
                  }
                })
                returnedMatches.forEach(match => {
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

              }
            );

              this.matches = returnedMatches;

            });

          },
          err => { console.log(err) }
        )
  }

  divisionObj;
  priorDiv;
  @Input() set division(val) {
    if (val) {
      if (this.divisionObj) {
        this.priorDiv = this.divisionObj.divisionConcat;
      }
      this.divisionObj = val;
      // this.initTeamSchedule(val._id);
      // this.ngOnInit();
    }
  }

  seasonVal;
  priorSval;
  @Input() set season(val) {
    if (val) {
      if(this.seasonVal){
        this.priorSval = this.seasonVal;
      }
      this.seasonVal = val;
      // this.initTeamSchedule(val._id);
      // this.ngOnInit();
    }
  }


  // todayDate;
  ngOnInit() {

  }

  private initialize() {
    if (this.seasonVal) {
      this.initTeamSchedule(this.divisionObj, this.seasonVal);
    }
    else {
      this.timeService.getSesasonInfo().subscribe(res => {
        let currentSeason = res['value'];
        this.initTeamSchedule(this.divisionObj, currentSeason);
      }, err => {
      });
    }
  }

  ngOnChanges( changes: SimpleChanges){

    if(changes.division){
      if ((changes.division.currentValue && changes.division.currentValue['divisionConcat'] != null)) {
        if (changes.division.previousValue && changes.division.currentValue['divisionConcat'] != changes.division.previousValue['divisionConcat'] || !changes.division.previousValue) {
          this.divisionObj = changes.division.currentValue;
          this.initialize();
        }
      }
    }

    if(changes.season){
      if ((changes.season.currentValue && changes.season.currentValue != null)) {
        if (changes.season.previousValue && changes.season.currentValue != changes.season.previousValue || !changes.season.previousValue) {
          this.seasonVal = changes.season.currentValue;
          this.initialize();
        }
      }
    }

  }


}
