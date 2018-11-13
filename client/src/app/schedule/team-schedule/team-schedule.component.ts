import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Scheduler } from 'rxjs';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-team-schedule',
  templateUrl: './team-schedule.component.html',
  styleUrls: ['./team-schedule.component.css']
})
export class TeamScheduleComponent implements OnInit {

  constructor(private Auth:AuthService, private scheduleService:ScheduleService) { }

  rounds:any
  ngOnInit() {
    this.scheduleService.getTeamSchedules(6,this.Auth.getTeam(), null).subscribe(
      res=>{
        this.rounds = res;
        console.log(res);
      },
      err=>{console.log(err)}
    )
  }

  displayTime(ms){
    console.log(typeof ms);
    let d = new Date(parseInt(ms));
    console.log(d);
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    month=month+1;
    let hours = d.getHours();
    let suffix = "AM";
    if(hours>12){
      hours = hours-12;
      suffix = "PM";
    }
    
    let min = d.getMinutes();
    let dateTime = month+'/'+day+'/'+year+' @ '+hours+':'+min+" "+suffix;
    return dateTime;
  }

}
