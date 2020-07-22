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

  castTime;

  casterValid;
  @Input() ind;
  @Input() replayView = false;

  ngOnInit(): void {
    this.casterValid = this.checkRights();
  }

  updateView(match){
    this.match = match;
  }


  removeCaster(match) {
    this.scheduleService.addCaster(match.matchId, "", "").subscribe(
      (res) => {
        this.match = res;
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
