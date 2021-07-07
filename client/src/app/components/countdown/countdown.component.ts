import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../services/schedule.service';
import { UtilitiesService } from '../../services/utilities.service';
import { TeamService } from '../../services/team.service';
import { CountdownService } from '../../services/countdown.service';
import { Iinterval } from '../../services/iinterval';
import { TimeService } from '../../services/time.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: "app-countdown",
  templateUrl: "./countdown.component.html",
  styleUrls: ["./countdown.component.css"],
})
export class CountdownComponent implements OnInit {
  constructor(
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    public team: TeamService,
    private countdownService: CountdownService,
    private timeService: TimeService,
    private auth:AuthService
  ) {
    this.timeService.getSesasonInfo().subscribe((res) => {
      this.seasonStartDate = res["data"].seasonStartDate;
      this.registrationEndDate = res["data"].registrationEndDate;
      this.registrationOpen = res["data"].registrationOpen;
      this.ngOnInit();
    });
  }


  seasonStartDate;
  registrationOpen;
  registrationEndDate;
  teamName;

  validMatch = false;
  targetMatch = {
    casterName: "",
    casterUrl: "",
    divisionConcat: "",
    divisionDisplayName: "",
    scheduledTime: {
      startTime: 0,
    },
    away: {
      teamName: "",
      logo: "",
    },
    home: {
      teamName: "",
      logo: "",
    },
  };
  divisionInfo = {
    displayName: "",
  };

  timeRemaining: Iinterval = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  registrationTimeRemaining: Iinterval = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  startDate;

  homeImage;
  awayImage;

  preSeason;

  initCountdown() {
    this.countdownService
      .getCountDown(this.targetMatch.scheduledTime.startTime)
      .subscribe((tick) => {
        this.timeRemaining = tick;
      });
      if(this.registrationEndDate){
            this.countdownService
              .getCountDown(this.registrationEndDate)
              .subscribe((tick) => {
                this.registrationTimeRemaining = tick;
              });
      }
  }

  showRegBut
  ngOnInit() {
    this.teamName = this.team.routeFriendlyTeamName(this.auth.getTeam());
    this.showRegBut = this.auth.getCaptain();
    if (this.timeService.returnWeekNumber() > 0) {
      this.preSeason = false;

      this.scheduleService.getNearestMatch().subscribe(
        res=>{
          let nearestMatch = res[0];
          if (nearestMatch) {
            nearestMatch.scheduledTime.startTime = parseInt(
              nearestMatch.scheduledTime.startTime
            );
            this.startDate = nearestMatch.scheduledTime.startTime;
            this.targetMatch = nearestMatch;
            this.homeImage = this.team.imageFQDN(this.targetMatch.home.logo);
            this.awayImage = this.team.imageFQDN(this.targetMatch.away.logo);
            this.validMatch = true;
            this.initCountdown();
          }
        },(err)=>{
          console.warn(err);
        }
      )

    } else {
      this.startDate = this.seasonStartDate;
      this.targetMatch.scheduledTime.startTime = this.seasonStartDate;
      this.validMatch = false;
      this.preSeason = true;
      let now = Date.now();
      if(now>this.registrationEndDate){
        this.registrationEndDate = null;
      }
      this.initCountdown();
    }
  }
}

function nextDate(startDate, dates) {
  var startTime = +startDate;
  var nearestDate, nearestDiff = Infinity;
  for (var i = 0, n = dates.length; i < n; ++i) {
    var diff = +dates[i].scheduledTime.startTime - startTime;
    if (diff > 0 && diff < nearestDiff) {
      nearestDiff = diff;
      nearestDate = dates[i];
    }
  }
  return nearestDate;
}
