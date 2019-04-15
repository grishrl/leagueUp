import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UtilitiesService } from '../services/utilities.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-match-schedule',
  templateUrl: './match-schedule.component.html',
  styleUrls: ['./match-schedule.component.css']
})
export class MatchScheduleComponent implements OnInit {

  constructor(private router:Router, private Auth: AuthService, public util:UtilitiesService) { }
  recTeam;
  todayDate;
  recMatch;

  scheduleDeadline;

  ngOnInit() {
    this.todayDate = new Date().getTime();

    if (this.recMatch.scheduleDeadline){
      this.scheduleDeadline = this.recMatch.scheduleDeadline - 604800000;
    }
  }

  @Input() set team(_team){
    if(!this.util.isNullOrEmpty(_team)){
      this.recTeam = _team;
    }
  }

  @Input() set match(_match){
    if(this.util.isNullOrEmpty(_match)){
      this.recMatch = _match;
    }
  }

  scheduleMatch(id) {
    this.router.navigate(['schedule/scheduleMatch', id]);
  }

  userCanSchedule() {
    if (this.recTeam == this.Auth.getTeam() && this.Auth.getCaptain() != 'false') {
      return true;
    } else {
      return false;
    }
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

}
