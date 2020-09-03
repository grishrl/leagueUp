import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { Match } from 'src/app/classes/match.class';
import { HeroesProfileService } from 'src/app/services/heroes-profile.service';
import { environment } from 'src/environments/environment';
import { forEach as _forEach } from 'lodash';
import { TimeserviceService } from 'src/app/services/timeservice.service';

@Component({
  selector: "app-match-results-view",
  templateUrl: "./match-results-view.component.html",
  styleUrls: ["./match-results-view.component.css"],
})
export class MatchResultsViewComponent implements OnInit {
  recId;

  constructor(
    private timeService: TimeserviceService,
    private scheduleService: ScheduleService,
    private route: ActivatedRoute
  ) {
        if (this.route.snapshot.params["id"]) {
          this.recId = this.route.snapshot.params["id"];
        }
  }

  match: Match = new Match();
  seasonVal;

  ngOnInit(): void {
    console.log("this", this.match, this.recId);
    this.scheduleService.getMatchInfo(this.recId).subscribe(
      (res) => {
        this.match = res;
      },
      (err) => {}
    );
  }
  // recId;
  // constructor(public util: UtilitiesService, private scheduleService:ScheduleService, private route: ActivatedRoute, public team: TeamService,  private timeService:TimeserviceService) {
  //   if (this.route.snapshot.params['id']) {
  //     this.recId = this.route.snapshot.params['id'];
  //   }
  // }

  // match: Match = new Match();
  // resultsArray = [];

  // seasonVal;

  // homeScore;
  // awayScore;
  // homeLogo;
  // awayLogo;

  // ngOnInit() {

  //   this.timeService.getSesasonInfo().subscribe(
  //     time => {
  //       let currentSeason = time.value;
  //       this.scheduleService.getMatchInfo(this.recId).subscribe(
  //         res => {
  //           this.match = res;
  //           if (this.match.season != currentSeason) {
  //             this.seasonVal = this.match.season;
  //           }
  //           this.homeLogo = this.team.imageFQDN(
  //             this.match.home.logo,
  //             this.seasonVal
  //           );
  //           this.awayLogo = this.team.imageFQDN(
  //             this.match.away.logo,
  //             this.seasonVal
  //           );
  //           this.homeScore = this.reportScore(this.match, 'home');
  //           this.awayScore = this.reportScore(this.match, "away");
  //         },
  //         err => {

  //         }
  //       )
  //     });

  // }

  // reportScore(match, side) {
  //   let ret;
  //   if (match.forfeit) {
  //     if (match[side].score == 0) {
  //       ret = 'F';
  //     } else {
  //       ret = 0;
  //     }
  //   } else {
  //     ret = match[side].score;
  //   }
  //   return ret;
  // }
}
