import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/team.service';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { Match } from 'src/app/classes/match.class';

@Component({
  selector: "app-match-results-header",
  templateUrl: "./match-results-header.component.html",
  styleUrls: ["./match-results-header.component.css"],
})
export class MatchResultsHeaderComponent implements OnInit {
  seasonVal;
  timeVal;
  constructor(
    public util: UtilitiesService,
    public team: TeamService,
    private timeService: TimeserviceService
  ) {
    this.timeService.getSesasonInfo().subscribe((time) => {
      this.seasonVal = time.value;
      this.timeVal = time.value;
      this.init();
    });
  }

  matchVal: Match = new Match();

  @Input() set match(val){
    if(val){
      this.matchVal = val;
      this.init();
    }
  }

  homeScore;
  awayScore;
  homeLogo;
  awayLogo;

  ngOnInit() {

  }

  init() {
    if (this.util.returnBoolByPath(this.matchVal, "season")) {
      this.seasonVal = this.matchVal.season;
    }

    console.log(this.matchVal);

    if(this.seasonVal != this.timeVal){
      this.homeLogo = this.team.imageFQDN(
        this.matchVal.home.logo,
        this.seasonVal
      );
      this.awayLogo = this.team.imageFQDN(
        this.matchVal.away.logo,
        this.seasonVal
      );
    }else{
      this.homeLogo = this.team.imageFQDN(
        this.matchVal.home.logo
      );
      this.awayLogo = this.team.imageFQDN(
        this.matchVal.away.logo
      );
    }

    this.homeScore = this.reportScore(this.matchVal, "home");
    this.awayScore = this.reportScore(this.matchVal, "away");
  }

  reportScore(match, side) {
    let ret;
    if (match.forfeit) {
      if (match[side].score == 0) {
        ret = "F";
      } else {
        ret = 0;
      }
    } else {
      ret = match[side].score;
    }
    return ret;
  }
}

/*

  */
