import { Component, OnInit, Input } from '@angular/core';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AuthService } from 'src/app/services/auth.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Match } from 'src/app/classes/match.class';

@Component({
  selector: "app-caster-dashboard-match-display",
  templateUrl: "./caster-dashboard-match-display.component.html",
  styleUrls: ["./caster-dashboard-match-display.component.css"]
})
export class CasterDashboardMatchDisplayComponent implements OnInit {
  constructor(
    private scheduleService: ScheduleService,
    public util: UtilitiesService,
    private Auth: AuthService
  ) {}

  @Input() set recMatch(val) {
    if(val){
      this.match = val;
    }
  }

  match = new Match();

  casterValid;
  @Input() ind;

  ngOnInit(): void {
    this.casterValid = this.checkRights();
  }

  claimMatch(match) {
    this.scheduleService.addCasterOcc(match).subscribe(
      res => {
        this.ngOnInit();
      },
      err => {
        console.log(err);
      }
    );
  }

  removeCaster(match) {
    this.scheduleService.addCaster(match.matchId, "", "").subscribe(
      res => {
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
      err => {
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
