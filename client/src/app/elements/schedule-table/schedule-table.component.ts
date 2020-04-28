import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.css']
})
export class ScheduleTableComponent implements OnInit {

  constructor(public teamServ: TeamService, public util: UtilitiesService, private router: Router, public auth: AuthService, private scheduleService:ScheduleService) { }

  matchesVal = [];
  @Input() set matches(val){
    if(val){
      val.forEach(
        match=>{
          match.home.logo = this.teamServ.imageFQDN(match.home.logo);
          match.away.logo = this.teamServ.imageFQDN(match.away.logo);
        }
      )
      this.matchesVal = val;

    }else{
      this.matchesVal = [];
    }
  };
  @Input() seasonVal;
  @Input() showRound = true;
  @Input() showCaster = false;
  @Input() recTeam;
  todayDate;
  @Input() divColumn = false;

  isCaster:Boolean=false;
  ngOnInit() {
    this.todayDate = new Date().getTime();
    this.isCaster = this.auth.isCaster();
  }

  hasDeadline(match) {
    return match.hasOwnProperty("scheduleDeadline");
  }

  userCanSchedule(match) {
    let userTeam = this.auth.getTeam()
    let isCapt = this.auth.getCaptain();
    if (match.home.teamName == userTeam || match.away.teamName == userTeam){
      if(isCapt != 'false'){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }

  }

  scheduleMatch(id) {
    this.router.navigate(['schedule/scheduleMatch', id]);
  }

  checkDate(match) {

    let ret = false;
    if (match['scheduleDeadline']) {
      let intDate = parseInt(match['scheduleDeadline']);
      let weekAgo = intDate - 604800000;
      if (this.todayDate > weekAgo) {
        ret = true;
      }
    }
    return ret;
  }

  claimMatch(match) {

    this.scheduleService.addCasterOcc(match).subscribe(
      res => {
        match = res;
        // this.ngOnInit();
      },
      err => {
        console.log(err);
      }
    )

  }

}
