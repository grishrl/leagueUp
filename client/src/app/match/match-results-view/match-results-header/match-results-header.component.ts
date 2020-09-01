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
  constructor(
    public util: UtilitiesService,
    private scheduleService: ScheduleService,
    private route: ActivatedRoute,
    public team: TeamService,
    private timeService: TimeserviceService
  ) {
    this.timeService.getSesasonInfo().subscribe((time) => {
      this.seasonVal = time.value;
    });
  }

  @Input() match: Match = new Match();

  homeScore;
  awayScore;
  homeLogo;
  awayLogo;

  ngOnInit() {
    if(this.match.season){
      this.seasonVal = this.match.season
    }
    this.init();
  }

  init() {
    this.homeLogo = this.team.imageFQDN(this.match.home.logo, this.seasonVal);
    this.awayLogo = this.team.imageFQDN(this.match.away.logo, this.seasonVal);
    this.homeScore = this.reportScore(this.match, "home");
    this.awayScore = this.reportScore(this.match, "away");
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
