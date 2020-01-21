import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { environment } from '../../../../environments/environment';
import { Match } from '../../../classes/match.class';

@Component({
  selector: 'app-match-edit',
  templateUrl: './match-edit.component.html',
  styleUrls: ['./match-edit.component.css']
})
export class MatchEditComponent implements OnInit {

  //component properties
  matchId;
  times: any[] = [];
  // match: any = {
  //   home: {
  //     teamName: '',
  //     score: null
  //   },
  //   away: {
  //     teamName: '',
  //     score: null
  //   },
  //   scheduledTime:{
  //     startTime:null
  //   },
  //   casterName: null,
  //   casterUrl: null,
  //   notes:'',
  //   forfeit:false
  // }; //match prototype
  match = new Match();
  homeScore: number;
  awayScore: number;
  suffix;
  friendlyTime;
  friendlyDate;
  amPm = ['PM', 'AM'];


  constructor(private route: ActivatedRoute, private scheduleService: ScheduleService, private adminService: AdminService, private util:UtilitiesService) {
    if (this.route.snapshot.params['id']) {
      this.matchId = this.route.snapshot.params['id'];
    }
  }

  ngOnInit() {
    this.scheduleService.getMatchInfo(this.matchId).subscribe(res=>{
      this.match = res;
      if (this.match.away.score || this.match.home.score) {
        this.homeScore = this.match.home.score;
        this.awayScore = this.match.away.score;
      }
      if( !this.match.hasOwnProperty('scheduledTime') ){
        this.match.scheduledTime = {
          startTime:null,
          endTime:null
        }
      }else{
        // this.friendlyDate = this.util.getDatePickerFormatFromMS(this.match.scheduledTime.startTime);
        this.friendlyTime = this.util.getTimeFromMS(this.match.scheduledTime.startTime);
        this.suffix = this.util.getSuffixFromMS(this.match.scheduledTime.startTime);
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

  saveMatch(match){


    let submittable = true;

    if (this.homeScore != undefined && this.homeScore != null){
      match.home.score = this.homeScore;
    }

    if (this.awayScore != undefined && this.awayScore != null) {
      match.away.score = this.awayScore;
    }

    // console.log(this.match.scheduledTime.startTime , this.friendlyTime)
    if (this.match.scheduledTime.startTime && this.friendlyTime){

      this.friendlyDate = new Date(this.match.scheduledTime.startTime);
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
      setDate.setFullYear(years, month, day);
      setDate.setHours(colonSplit[0], colonSplit[1], 0, 0);

      let msDate = setDate.getTime();
      // console.log('msDate ', msDate);
      let endDate = msDate + 5400000;
      match.scheduledTime.startTime = msDate;
      match.scheduledTime.endTime = endDate;
    }

    if(submittable){
      console.log(match);
      this.adminService.matchUpdate(match).subscribe(
        (res) => {
          this.ngOnInit();
        },
        (err) => {
          console.log(err);
        }
      )
    }


  }

}
