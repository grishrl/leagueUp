import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { FilterService } from 'src/app/services/filter.service';
import { find } from 'lodash';

@Component({
  selector: 'app-match-management',
  templateUrl: './match-management.component.html',
  styleUrls: ['./match-management.component.css']
})
export class MatchManagementComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  //component properties
  hideForm = true;
  selectedRound: any
  selectedDivision: any
  originalMatches: any
  filterMatches: any
  filterTeam: any
  filterTeam2:string
  rounds = [];
  divisions = []

  constructor(private scheduleService: ScheduleService, private adminService: AdminService,
    public util: UtilitiesService, private timeService:TimeserviceService, private filterServ: FilterService) { }

  ngAfterViewInit() {
    this.paginator.pageIndex = 0;
  }

  currentSeason;
  tourns = [];
  ngOnInit() {
    this.adminService.getDivisionList().subscribe((res) => {
      this.divisions = res;
      this.timeService.getSesasonInfo().subscribe(
        res => {
          this.currentSeason = res['value'];
          this.scheduleService.getScheduleMatches(this.currentSeason, null, null).subscribe(
            (sched) => {
              this.originalMatches = sched;
              this.scheduleService.getActiveTournaments().subscribe(
                tourns=>{
                  this.tourns = tourns;
                  this.mergeTournMatches();
                  this.filterMatches = sched;
                  this.filterMatches.forEach((match) => {
                    match.submitCaster = {
                      name: "",
                      URL: "",
                    };
                    if (this.rounds.indexOf(match.round) < 0) {
                      this.rounds.push(match.round);
                    }
                  });
                  this.rounds.sort();
                  this.length = this.filterMatches.length;
                  this.displayArray = this.filterMatches.slice(
                    0,
                    this.pageSize
                  );
                },
                err=>{
                  console.log(err);
                }
              );
            }
          )
        }
      );

    }, (err) => {
      console.log(err);
    });
  }

  mergeTournMatches(){
    let i = 0;
    this.tourns.forEach(
      tourn=>{
        tourn.teamMatches.forEach( match => {
          let ind = find(this.originalMatches, (o)=>{
            return o.matchId == match.matchId;
          });
          if(!ind){
            i++;
            this.originalMatches.push(match);
          }
        });
      }
    );
    console.log(`${i} matches merged`);
  }

  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];
  pageIndex: number;

  pageEventHandler(pageEvent: PageEvent) {

    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize
    if (endSlice > this.filterMatches.length) {
      endSlice = this.filterMatches.length;
    }

    this.displayArray = [];
    this.displayArray = this.filterMatches.slice(i, endSlice)

  }

  /*
  div, round, team
  div, round,
  div, team,
  round, team,
  div,
  round,
  team
  */
 //filters the matches based on selected criteria
  doFilterMatches(div, round, team) {

    this.filterMatches = this.originalMatches.filter(match => {
      let home, away;
      if(!this.util.returnBoolByPath(match, 'away.teamName')){
        away = '';
      }else{
        away = match.away.teamName.toLowerCase();
      }
      if (!this.util.returnBoolByPath(match, 'home.teamName')){
        home = '';
      }else{
        home = match.home.teamName.toLowerCase();
      }
      if(team){
        team = team.toLowerCase();
      }

      let pass = false;
      if (div && round && team) {
        if (div == match.divisionConcat && round == match.round &&
          (away.indexOf(team) > -1 || home.indexOf(team) >-1 )) {
          pass = true;
        }
      } else if (div && round){
        if (div == match.divisionConcat && round == match.round) {
          pass = true;
        }
      } else if (div && team) {
        if (div == match.divisionConcat && (away.indexOf(team) > -1 || home.indexOf(team) > -1 )) {
          pass = true;
        }
      } else if (round && team) {
        if (round == match.round && (away.indexOf(team) > -1 || home.indexOf(team) > -1 )) {
          pass = true;
        }
      }else if(div) {
        if (div == match.divisionConcat) {
          pass = true;
        }
      } else if (round) {
        if (round == match.round) {
          pass = true;
        }
      }else if(team){
        if (away.indexOf(team) > -1 || home.indexOf(team) > -1 ){
          pass = true;
        }
      } else {
        pass = true
      }
      return pass;
    }
    );

    this.length = this.filterMatches.length;
    this.displayArray = this.filterMatches.slice(0, this.pageSize > this.length ? this.length : this.pageSize);
    this.paginator.firstPage();
  }

  filterOtherTeam(teamName){
    if(this.filterTeam){
      let showing = this.displayArray;
      showing = showing.filter((a) => { return this.filterServ.testName(a, teamName)}  );
      this.displayArray = showing;
    }
  }

}
