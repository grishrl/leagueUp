import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AuthService } from 'src/app/services/auth.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Match } from 'src/app/classes/match.class';

@Component({
  selector: "app-caster-dashboard-match-display",
  templateUrl: "./caster-dashboard-match-display.component.html",
  styleUrls: ["./caster-dashboard-match-display.component.css"],
})
export class CasterDashboardMatchDisplayComponent implements OnInit {
  constructor(
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    private Auth: AuthService
  ) {}

  @Input() set recMatch(val) {
    if (val) {
      this.match = val;
    }
  }

  match = new Match();

  casterValid;
  @Input() ind;
  @Input() replayView = false;

  times: any[] = []; //local array that is populated progromatticaly to give users a drop down of times on 15 min interval to select
  castTime;
  castDate;
  suffix;
  amPm = ["PM", "AM"]; //local propery holds array for the am/pm dropdown

  ngOnInit(): void {
    this.casterValid = this.checkRights();

    //build out the selectable times for the user, in 15 min intervals
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

  claimMatch(match) {
    this.scheduleService.addCasterOcc(match).subscribe(
      (res) => {
        this.ngOnInit();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  removeCaster(match) {
    this.scheduleService.addCaster(match.matchId, "", "").subscribe(
      (res) => {
        match.casterName = "";
        match.casterUrl = "";
        // let i = -1;
        // this.originalMatches.forEach((match, index) => {
        //   if (match.matchId == res.matchId) {
        //     i = index;
        //   }
        // });
        // if (i > -1) {
        //   this.originalMatches[i] = res;
        // }
        // this.displayArray.forEach((match, index) => {
        //   if (match.matchId == res.matchId) {
        //     i = index;
        //   }
        // });
        // if (i > -1) {
        //   this.displayArray[i] = res;
        // }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  checkRights() {
    let ret = false;
    if (this.Auth.getAdmin() && this.Auth.getAdmin().indexOf("match") > -1) {
      ret = true;
    }
    return ret;
  }
}
