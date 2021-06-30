/*
9-18-2020 - LG
This component is currently used for scheduling matches; the teams use this componenet to perform match scheduling
*/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { TeamService } from 'src/app/services/team.service';
import { environment } from '../../../environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment-timezone';
import { UtilitiesService } from 'src/app/services/utilities.service';



@Component({
  selector: 'app-match-scheduler',
  templateUrl: './match-scheduler.component.html',
  styleUrls: ['./match-scheduler.component.css']
})
export class MatchSchedulerComponent implements OnInit {

  //component properties
  matchId //local prop to hold match Id recieved from route
  matchDate = moment();  //local prop that holds the selected date by user from the calendar
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
    private Auth: AuthService, private util:UtilitiesService) {
    //get the id provided in the URL route
    this.matchId = this.route.snapshot.params['id'];
   }

homeLogo;
awayLogo;

index = 0;
  ngOnInit() {
    //get the match from the ID we receieved
    this.scheduleService.getMatchInfo(this.matchId).subscribe(
      res=>{
        //assign the result to local prop match
        this.match = res;
        this.team.getTeam(res.home.teamName).subscribe(homeTeam => {
          this.homeTeam = homeTeam
          this.homeLogo = this.team.imageFQDN(this.homeTeam.logo);
        }, err => {
          console.warn(err);
        });
        this.team.getTeam(res.away.teamName).subscribe(awayTeam => {
          this.awayTeam = awayTeam
          this.awayLogo = this.team.imageFQDN(this.awayTeam.logo);
        }, err => {
          console.warn(err);
        })
       },
      err=>{ console.warn(err) }
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

      let msDate = this.util.returnMSFromFriendlyDateTime(this.matchDate, this.time, this.suffix);
      let endDate = msDate + 5400000;

      if (msDate) {
        this.scheduleService.scheduleMatchTime(this.match.matchId, msDate, endDate).subscribe(
          res=>{
            this.router.navigateByUrl('/teamProfile/'+this.team.routeFriendlyTeamName(this.Auth.getTeam()));
          },
          err=>{
            console.warn(err)
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
