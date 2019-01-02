import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-match-edit',
  templateUrl: './match-edit.component.html',
  styleUrls: ['./match-edit.component.css']
})
export class MatchEditComponent implements OnInit {

  //component properties
  matchId;
  times: any[] = [];
  match: any = {
    home: {
      teamName: '',
      score: null
    },
    away: {
      teamName: '',
      score: null
    },
    casterName: null,
    casterUrl: null
  }; //match prototype
  homeScore: number;
  awayScore: number;
  suffix;
  friendlyTime;
  friendlyDate;
  amPm = ['PM', 'AM'];

  
  constructor(private route: ActivatedRoute, private scheduleService: ScheduleService, private adminService: AdminService) { 
    if (this.route.snapshot.params['id']) {
      this.matchId = this.route.snapshot.params['id'];
    }
  }
  



  ngOnInit() {
    this.scheduleService.getMatchInfo(6, this.matchId).subscribe(res=>{
      this.match = res;
      if (this.match.away.score || this.match.home.score) {
        this.homeScore = this.match.home.score;
        this.awayScore = this.match.away.score;
      }
      if(!this.match.scheduledTime){
        this.match.scheduledTime = {};
      }else{
        this.backwardsCompatTime(this.match.scheduledTime.startTime)
      }
    }, err=>{
      console.log(err);
    })
    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = '00';
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
  }

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

  backwardsCompatTime(msDate){
    let time = new Date(parseInt(msDate));
    this.friendlyDate = time;
    this.suffix = 'AM';
    let hours = time.getHours();
    
    if (hours > 12) {
      hours = hours - 12;
      this.suffix = "PM";
    }

    let min = time.getMinutes();
    let minStr;

    if (min == 0) {
      minStr = '00';
    } else {
      minStr = min.toString();
    }

    this.friendlyTime = hours+":"+minStr

  }

  saveMatch(match){
    if(this.friendlyDate && this.friendlyTime){
      let years = this.friendlyDate.getFullYear();
      let month = this.friendlyDate.getMonth();
      let day = this.friendlyDate.getDate();

      let colonSplit = this.friendlyTime.split(':');
      colonSplit[1] = parseInt(colonSplit[1]);
      if (this.suffix == 'PM') {
        colonSplit[0] = parseInt(colonSplit[0]);
        colonSplit[0] += 12;
      }
      let setDate = new Date();
      setDate.setFullYear(years);
      setDate.setMonth(month);
      setDate.setDate(day);
      setDate.setHours(colonSplit[0]);
      setDate.setMinutes(colonSplit[1]);
      let msDate = setDate.getTime();
      let endDate = msDate + 5400000;
      match.scheduledTime.startTime = msDate;
      match.scheduledTime.endDate = endDate;
    } else if (this.friendlyDate && !this.friendlyTime){
      alert('You have entered a date but no time!');
    } else if (!this.friendlyDate && this.friendlyTime) {
      alert('You have entered a time but no date!');
    }

    this.adminService.matchUpdate(match).subscribe(
      (res)=>{
        this.ngOnInit();
      },
      (err)=>{
        console.log(err);
      }
    )
    
  }
 
}
