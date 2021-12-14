import { Component, OnInit, Input } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from 'src/app/services/team.service';
import { TimeService } from 'src/app/services/time.service';
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
    private timeService: TimeService
  ) {
    this.timeService.getSesasonInfo().subscribe((res) => {
      this.seasonVal = res.value;
      this.timeVal = res.value;
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
