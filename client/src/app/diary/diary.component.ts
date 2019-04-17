import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../services/schedule.service';
import { UtilitiesService } from '../services/utilities.service';
import { TeamService } from '../services/team.service';

@Component({
  selector: 'app-diary',
  templateUrl: './diary.component.html',
  styleUrls: ['./diary.component.css']
})
export class DiaryComponent implements OnInit {

  constructor(private scheduleService: ScheduleService, public util:UtilitiesService, public team:TeamService) { }

  next4matches = [];
  ngOnInit() {
    this.scheduleService.getAllMatchesWithStartTime().subscribe(
      res => {
        let matches = res;
        // matches.sort( (a,b)=>{
        //   if (a.scheduledTime.startTime > b.scheduledTime.startTime){
        //     return 1;
        //   }else{
        //     return -1;
        //   }
        // });
        let now = Date.now();

        matches = matches.filter( a=>{
          if (a.scheduledTime && a.scheduledTime.startTime) {
            a.scheduledTime.startTime = parseInt(a.scheduledTime.startTime);
          }
          if(a.scheduledTime && a.scheduledTime.startTime > now){
            return true;
          }else{
            return false;
          }
        });
        matches = matches.sort ( (a, b)=>{
          if(a.scheduledTime.startTime > b.scheduledTime.startTime){
            return 1;
          }else{
            return -1;
          }
        });
        matches.forEach( (match, ind)=>{
          if(ind<4){
            this.next4matches.push(match);
          }
        });
        console.log(matches);
        // let nearestMatch = nextDate(now, matches);

        // if (nearestMatch) {
        //   nearestMatch.scheduledTime.startTime = parseInt(nearestMatch.scheduledTime.startTime);
        //   // console.log(nearestMatch);
        //   this.startDate = new Date(nearestMatch.scheduledTime.startTime);
        //   this.targetMatch = nearestMatch;
        //   this.initCountdown();
        //   this.divisionService.getDivision(this.targetMatch.divisionConcat).subscribe(
        //     reply => {
        //       this.divisionInfo = reply;
        //     },
        //     err => {
        //       console.log(err)
        //     }
        //   )
        // }

      },
      err => { }
    )
  }

}
