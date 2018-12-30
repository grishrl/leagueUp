import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';


@Component({
  selector: 'app-match-schedule',
  templateUrl: './match-schedule.component.html',
  styleUrls: ['./match-schedule.component.css']
})
export class MatchScheduleComponent implements OnInit {

  matchId
  constructor(private route: ActivatedRoute, private scheduleService:ScheduleService) {
    this.matchId = this.route.snapshot.params['id'];
   }

  times:any[]=[];

 match:any;
  ngOnInit() {
    this.scheduleService.getMatchInfo(6, this.matchId).subscribe(
      res=>{ 
        this.match = res;
       },
      err=>{ console.log(err) }
    )
    for(let i=1; i < 13; i++){
      for(let j=0;j<=3;j++){
        let min:any = j*15;
        if(min==0){
          min = '00';
        }
        let time = i+":"+min;
        this.times.push(time);
      }
    }
  }

  homeScore:number
  awayScore:number
  scoreSelected(changed) {
    if (changed == 'home') {
      if (this.homeScore == 2) {
        this.awayScore = 0;
      } else if (this.homeScore == 1) {
        this.awayScore = 1;
      } else if (this.homeScore == 0) {
        this.awayScore = 2;
      }
    } else {
      if (this.awayScore == 2) {
        this.homeScore = 0;
      } else if (this.awayScore == 1) {
        this.homeScore = 1;
      } else if (this.awayScore == 0) {
        this.homeScore = 2;
      }
    }
  }

  mydate = new Date();
  time:any
  suffix:any

  saveSched(){
    let years = this.mydate.getFullYear();
    let month = this.mydate.getMonth();
    let day = this.mydate.getDate();
    let colonSplit = this.time.split(':');
    colonSplit[1]=parseInt(colonSplit[1]);
    if(this.suffix == 'PM'){
      colonSplit[0] = parseInt(colonSplit[0]);
      colonSplit[0]+=12;
    }
    let setDate = new Date();
    setDate.setFullYear(years);
    setDate.setMonth(month);
    setDate.setDate(day);
    setDate.setHours(colonSplit[0]);
    setDate.setMinutes(colonSplit[1]);
    let msDate = setDate.getTime();
    let endDate = msDate + 5400000;
    this.scheduleService.scheduleMatchTime(this.match.matchId, msDate, endDate).subscribe(
      res=>{
        //TODO: DO something?
        // console.log('saved ',res);
      },
      err=>{
        console.log(err)
      }
    )

  }

  amPm = ['PM', 'AM'];

}
