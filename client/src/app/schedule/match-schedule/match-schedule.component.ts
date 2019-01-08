import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';


@Component({
  selector: 'app-match-schedule',
  templateUrl: './match-schedule.component.html',
  styleUrls: ['./match-schedule.component.css']
})
export class MatchScheduleComponent implements OnInit {

  //component properties
  matchId //local prop to hold match Id recieved from route
  mydate = new Date();  //local prop that holds the selected date by user from the calendar 
  time: any //local prop that hold the selected time from user
  suffix: any //local prop for selected AM/PM suffix
  times: any[] = [];  //local array that is populated progromatticaly to give users a drop down of times on 15 min interval to select
  match: any;  //local prop for holding the returned match
  homeScore: number //local prop for scores
  awayScore: number //local prop for scores
  amPm = ['PM', 'AM']; //local propery holds array for the am/pm dropdown

  constructor(private route: ActivatedRoute, private scheduleService:ScheduleService, private router:Router) {
    //get the id provided in the URL route
    this.matchId = this.route.snapshot.params['id'];
   }

  

 
  ngOnInit() {
    //get the match from the ID we receieved
    this.scheduleService.getMatchInfo(6, this.matchId).subscribe(
      res=>{ 
        //assign the result to local prop match
        this.match = res;
       },
      err=>{ console.log(err) }
    )
    //build out the selectable times for the user, in 15 min intervals
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

  //function from click to save schedule
  saveSched(){
    //calculate the millisecond date of the scheduled start of the match cause that's easy to save.
    //TODO: this might go into a service because I think it's used other places
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
        //TODO: will i need to implement a route here?
        this.router.navigateByUrl('/schedule/teamSchedule');
      },
      err=>{
        console.log(err)
      }
    )

  }

}
