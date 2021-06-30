import { Component, OnInit, Input } from '@angular/core';
import { TeamService } from 'src/app/services/team.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';

const ROUND = 'round';
const SCHEDULEDTIME = 'scheduledTime';

@Component({
  selector: 'app-schedule-table',
  templateUrl: './schedule-table.component.html',
  styleUrls: ['./schedule-table.component.css']
})
export class ScheduleTableComponent implements OnInit {

  constructor(public teamServ: TeamService, public util: UtilitiesService, private router: Router, public auth: AuthService, private scheduleService:ScheduleService) { }

  matchesVal = [];

  colSpanInt = 4;

@Input() sortOrder = 'round';

@Input() showBye = false;


@Input() set matches(val){
  if(val){
    val.forEach(
      match=>{
        if(this.util.returnBoolByPath(match, 'home.logo')){
          match.home.logo = this.teamServ.imageFQDN(match.home.logo);
        }
        if(this.util.returnBoolByPath(match, 'away.logo')){
          match.away.logo = this.teamServ.imageFQDN(match.away.logo);
        }
      }
    );
    if(this.sortOrder == ROUND){
            val.sort((a, b) => {
              if (
                !this.util.returnBoolByPath(a, "round") ||
                !this.util.returnBoolByPath(b, "round")
              ) {
                return 0;
              } else if (a.round > b.round) {
                return 1;
              } else {
                return -1;
              }
            });
    }else if(this.sortOrder == SCHEDULEDTIME){
        val = this.util.sortMatchesByTime(val);
    }

    if(this.showBye){
      let missingRound;
      let index = 0;
        for (var i = 0; i < val.length; i++) {

          let round = i + 1;
          let found = false;
          val.forEach((match) => {
            if (match.round == round) {
              found = true;
            }
          });
          if (found == false) {
            missingRound = round;
            index = i;
          }
        }

        if(missingRound){
          val.splice(index, 0, {
            round: missingRound,
            type:'bye'
          });
        }

    }

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
  @Input() disallowSchedule = false;

  isCaster:Boolean=false;
  ngOnInit() {
    this.todayDate = new Date().getTime();
    this.isCaster = this.auth.isCaster();
    if(this.divColumn){
      this.colSpanInt+=1;
    }
    if(this.showRound){
      this.colSpanInt+=1;
    }
  }

  userCanSchedule(match) {
    let userTeam = this.auth.getTeam()
    let isCapt = this.auth.getCaptain();
    if(this.disallowSchedule){
      return false
    }else if (this.util.returnBoolByPath(match, 'home.teamName') && match.home.teamName == userTeam || this.util.returnBoolByPath(match, 'away.teamName') && match.away.teamName == userTeam){
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
        console.warn(err);
      }
    )

  }

}
