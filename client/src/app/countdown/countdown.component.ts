import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { UtilitiesService } from '../services/utilities.service';
import { DivisionService } from '../services/division.service';
import { TeamService } from '../services/team.service';
import { CountdownService } from '../services/countdown.service';
import { Iinterval } from '../model/iinterval';


@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit {

  constructor(private scheduleService:ScheduleService, public util:UtilitiesService, public team: TeamService, private countdownService:CountdownService) { }

  validMatch = false;
  targetMatch = {
    casterName:'',
    casterUrl:'',
    divisionConcat:'',
    divisionDisplayName:'',
    scheduledTime:{
      startTime:0
    },
    away:{
      teamName:'',
      logo:''
    },
    home: {
      teamName: '',
      logo: ''
    }
  };
  divisionInfo = {
    displayName:''
  }

  timeRemaining:Iinterval={
    days:0,
    hours:0,
    minutes:0,
    seconds:0
  }

  startDate;

  initCountdown(){
    this.countdownService.getCountDown(this.targetMatch.scheduledTime.startTime).subscribe(
      tick=>{
        this.timeRemaining = tick;
      }
    )
  }

  ngOnInit() {
    this.scheduleService.getAllMatchesWithStartTime().subscribe(
      res=>{
        let matches = res;

        matches = matches.filter( match => {
          return this.util.returnBoolByPath(match, 'casterName');
        });
        let now = Date.now();
        let nearestMatch = nextDate(now, matches);

        if (nearestMatch){
          nearestMatch.scheduledTime.startTime = parseInt(nearestMatch.scheduledTime.startTime);
          this.startDate = new Date(nearestMatch.scheduledTime.startTime);
          this.targetMatch = nearestMatch;
          this.validMatch = true;
          this.initCountdown();
        }

      },
      err=>{
        console.log(err);
      }
    )
  }

}
function nextDate(startDate, dates) {
  var startTime = +startDate;
  var nearestDate, nearestDiff = Infinity;
  for (var i = 0, n = dates.length; i < n; ++i) {
    var diff = +dates[i].scheduledTime.startTime - startTime;
    if (diff > 0 && diff < nearestDiff) {
      nearestDiff = diff;
      nearestDate = dates[i];
    }
  }
  return nearestDate;
}
