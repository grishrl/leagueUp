import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { TeamService } from 'src/app/services/team.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { FilterService } from 'src/app/services/filter.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import * as moment from 'moment-timezone';

@Component({
  selector: "app-match-paginator",
  templateUrl: "./match-paginator.component.html",
  styleUrls: ["./match-paginator.component.css"],
})
export class MatchPaginatorComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  currentSeason;
  constructor(
    public team: TeamService,
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    private filterService: FilterService
  ) {}

  @Input() set matches(inp) {
    if (inp) {
      this.originalMatches = inp;
      this.initSchedule();
    }
  }

  replay = false;
  @Input() set replayList(inp) {
    if (!this.util.isNullOrEmpty(inp)) {
      if(inp){
              this.startTimeFlt = null;
              this.replay = inp;
      }
    }
  }

  hideForm = true;
  selectedRound: any;
  selectedDivision: any;
  originalMatches: any;
  filterMatches: any;
  rounds = [];

  filterTeam: string = "";
  scheduledOnlyFlt: boolean = true;

  times: any[] = [];
  suffix;
  friendlyTime;
  friendlyDate;
  amPm = ["PM", "AM"];

  displayArray = [];
  length: number;
  pageSize: number = 10;
  filteredArray: any = [];
  pageIndex: number;
  tournamentOnlyFlt: false;
  divFlt;
  roundFlt;
  teamFlt;
  startTimeFlt;
  today;

  ngAfterViewInit() {
    this.paginator.pageIndex = 0;
  }

  pageEventHandler(pageEvent: PageEvent) {
    let i = pageEvent.pageIndex * this.pageSize;
    let endSlice = i + this.pageSize;
    if (endSlice > this.filterMatches.length) {
      endSlice = this.filterMatches.length;
    }

    this.displayArray = [];
    this.displayArray = this.filterMatches.slice(i, endSlice);
  }

  ngOnInit() {
    let zeroHour = moment();

    zeroHour.hours(0);
    zeroHour.minutes(0);
    zeroHour.milliseconds(0);

    this.friendlyDate = zeroHour.unix() * 1000;

    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = "00";
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
  }

  initSchedule() {
    this.length = this.originalMatches.length;
    this.filterMatches = this.originalMatches;
    this.filterMatches.forEach((match) => {
      match.submitCaster = {
        name: "",
        URL: "",
      };
      if (this.rounds.indexOf(match.round) < 0) {
        this.rounds.push(match.round);
      }
    });
    this.rounds = this.rounds.sort();
    // this.displayArray = this.filterMatches.slice(0, 10);

    //set console to be filtered by todays date automatically
    if(this.replay){
      this.displayArray = this.filterMatches.slice(0, 10);
    }else{
      this.filterByFriendlyDateToMS();
    }
  }

  resetTime() {
    this.startTimeFlt = null;
    this.friendlyDate = null;
    this.friendlyTime = null;
    this.doFilterMatches();
  }

  timeChanged() {
    if (this.friendlyDate && this.friendlyTime) {
      if (this.friendlyTime && this.suffix) {
        let setDate = moment(this.friendlyDate);

        this.endTimeFlt = this.friendlyDate + 86400000;

        this.startTimeFlt = this.util.returnMSFromFriendlyDateTime(
          setDate,
          this.friendlyTime,
          this.suffix
        );
        this.doFilterMatches();
      }
    } else if (this.friendlyDate) {
      this.filterByFriendlyDateToMS();
    }
  }

  private filterByFriendlyDateToMS() {
    this.endTimeFlt = this.friendlyDate + 86400000;
    this.startTimeFlt = this.friendlyDate;
    this.doFilterMatches();
  }

  selected(div) {
    this.divFlt = div;
    this.doFilterMatches();
  }

  //filters the matches based on selected criteria
  endTimeFlt;
  doFilterMatches() {
    this.filterMatches = this.originalMatches;
    if (this.filterMatches && this.filterMatches.length > 0) {
      if (!this.util.isNullOrEmpty(this.divFlt)) {
        this.filterMatches = this.filterMatches.filter((match) => {
          return this.filterService.testDivision(match, this.divFlt);
        });
      }
      if (!this.util.isNullOrEmpty(this.roundFlt)) {
        this.filterMatches = this.filterMatches.filter((match) => {
          return this.filterService.testRound(match, this.roundFlt);
        });
      }
      if (!this.util.isNullOrEmpty(this.teamFlt)) {
        this.filterMatches = this.filterMatches.filter((match) => {
          return this.filterService.testName(match, this.teamFlt);
        });
      }
      if (
        !this.util.isNullOrEmpty(this.tournamentOnlyFlt) &&
        this.tournamentOnlyFlt
      ) {
        this.filterMatches = this.filterMatches.filter((match) => {
          return this.filterService.testTournament(match);
        });
      }
      if (
        !this.util.isNullOrEmpty(this.scheduledOnlyFlt) &&
        this.scheduledOnlyFlt
      ) {
        this.filterMatches = this.filterMatches.filter((match) => {
          return this.filterService.testScheduled(match);
        });
        if (!this.util.isNullOrEmpty(this.startTimeFlt)) {
          this.filterMatches = this.filterMatches.filter((match) => {
            return this.filterService.testTime(
              match,
              this.startTimeFlt,
              this.endTimeFlt
            );
          });
        }
      } else {
        this.filterMatches = this.filterMatches.filter((match) => {
          return !this.filterService.testScheduled(match);
        });
      }

      this.filterMatches = this.util.sortMatchesByTime(this.filterMatches);
      this.length = this.filterMatches.length;
      this.displayArray = this.filterMatches.slice(
        0,
        this.pageSize > this.length ? this.length : this.pageSize
      );
      this.paginator.firstPage();
    }
  }
}
