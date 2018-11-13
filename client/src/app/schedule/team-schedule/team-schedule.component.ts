import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-team-schedule',
  templateUrl: './team-schedule.component.html',
  styleUrls: ['./team-schedule.component.css']
})
export class TeamScheduleComponent implements OnInit {
  recTeam
  constructor(private Auth: AuthService, private route: ActivatedRoute, private scheduleService:ScheduleService) {
    if (this.route.snapshot.params['id']) {
      this.recTeam = this.route.snapshot.params['id'];
    }
   }

  rounds:any
  ngOnInit() {
    let getTeam;
    if(this.recTeam){
      getTeam = this.recTeam;
    }else{
      getTeam = this.Auth.getTeam()
    }
    this.scheduleService.getTeamSchedules(6, getTeam, null).subscribe(
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
