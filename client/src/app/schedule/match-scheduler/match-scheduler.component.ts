import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-match-scheduler',
  templateUrl: './match-scheduler.component.html',
  styleUrls: ['./match-scheduler.component.css']
})
export class MatchSchedulerComponent implements OnInit {

  //component properties
  matchId //local prop to hold match Id recieved from route
  matchDate = Date.now();  //local prop that holds the selected date by user from the calendar
  time: any //local prop that hold the selected time from user
  suffix: any //local prop for selected AM/PM suffix
  times: any[] = [];  //local array that is populated progromatticaly to give users a drop down of times on 15 min interval to select
  match: any = {
    away:{},
    home:{}
  };  //local prop for holding the returned match
  homeScore: number //local prop for scores
  awayScore: number //local prop for scores
  amPm = ['PM', 'AM']; //local propery holds array for the am/pm dropdown

  constructor(public team: TeamService, private route: ActivatedRoute, private scheduleService:ScheduleService, private router:Router,
    private Auth: AuthService) {
    //get the id provided in the URL route
    this.matchId = this.route.snapshot.params['id'];
   }



index = 0;
  ngOnInit() {
    //get the match from the ID we receieved
    this.scheduleService.getMatchInfo(this.matchId).subscribe(
      res=>{
        //assign the result to local prop match
        this.match = res;
        this.team.getTeam(res.home.teamName).subscribe(homeTeam => {
          this.homeTeam = homeTeam
        }, err => {
          console.log(err);
        });
        this.team.getTeam(res.away.teamName).subscribe(awayTeam => {
          this.awayTeam = awayTeam
        }, err => {
          console.log(err);
        })
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

  checkDate() {
    let todayDate = new Date().getTime();
    let ret = false;
    if (this.match['scheduleDeadline']) {
      let intDate = parseInt(this.match['scheduleDeadline']);

      if (todayDate > intDate) {
        ret = true;
      }
    }
    return ret;
  }

  //function from click to save schedule
  saveSched(){
    //calculate the millisecond date of the scheduled start of the match cause that's easy to save.
    //TODO: this might go into a service because I think it's used other places

    if(!this.time){
      alert("Please select a date / time");
    }else{
      let colonSplit = this.time.split(':');

      colonSplit[1] = parseInt(colonSplit[1]);

      if (this.suffix == 'PM') {
        colonSplit[0] = parseInt(colonSplit[0]);
        colonSplit[0] += 12;
      }

      let setDate = new Date(this.matchDate);
      setDate.setHours(colonSplit[0], colonSplit[1], 0, 0);

      let msDate = setDate.getTime();
      let endDate = msDate + 5400000;

      if (msDate) {
        this.scheduleService.scheduleMatchTime(this.match.matchId, msDate, endDate).subscribe(
          res=>{
            this.router.navigateByUrl('/teamProfile/'+this.team.routeFriendlyTeamName(this.Auth.getTeam()));
          },
          err=>{
            console.log(err)
          }
        )
      } else {
        alert("Please select a date / time");
      }
    }

  }

  homeTeam
  awayTeam
  showSchedules = false;

  getTeamSchedules(){
    this.showSchedules = true;
  }

}
