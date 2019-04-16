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

  constructor(private scheduleService:ScheduleService, private divisionService:DivisionService, public util:UtilitiesService, public team: TeamService, private countdownService:CountdownService) { }

  targetMatch = {
    casterName:'',
    casterUrl:'',
    divisionConcat:'',
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
        // matches.sort( (a,b)=>{
        //   if (a.scheduledTime.startTime > b.scheduledTime.startTime){
        //     return 1;
        //   }else{
        //     return -1;
        //   }
        // });
        let now = Date.now();
        let nearestMatch = nextDate(now, matches);

        if (nearestMatch){
          nearestMatch.scheduledTime.startTime = parseInt(nearestMatch.scheduledTime.startTime);
          console.log(nearestMatch);
          this.targetMatch = nearestMatch;
          this.initCountdown();
          this.divisionService.getDivision(this.targetMatch.divisionConcat).subscribe(
            reply=>{
              this.divisionInfo = reply;
            },
            err=>{
              console.log(err)
            }
          )
        }

      },
      err=>{}
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
