import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import * as moment from 'moment-timezone';
import { Match } from '../../../classes/match.class';
import { MvpService } from 'src/app/services/mvp.service';
import { forEach } from 'lodash';

@Component({
  selector: "app-match-edit",
  templateUrl: "./match-edit.component.html",
  styleUrls: ["./match-edit.component.css"]
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
  amPm = ["PM", "AM"];
  mvpObj = {
    displayName: "",
    potg_link: ""
  };
  filePendingUpload;
  matchRound;
  winner;

  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private adminService: AdminService,
    private util: UtilitiesService,
    private mvpServ: MvpService
  ) {
    if (this.route.snapshot.params["id"]) {
      this.matchId = this.route.snapshot.params["id"];
    }
  }

  ngOnInit() {
    this.scheduleService.getMatchInfo(this.matchId).subscribe(
      res => {
        this.match = res;
        if (this.match.away.score || this.match.home.score) {
          this.homeScore = this.match.home.score;
          this.awayScore = this.match.away.score;
        }
        if (!this.match.hasOwnProperty("scheduledTime")) {
          this.match.scheduledTime = {
            startTime: null,
            endTime: null
          };
        } else {
          // this.friendlyDate = this.util.getDatePickerFormatFromMS(this.match.scheduledTime.startTime);
          this.friendlyTime = this.util.getTimeFromMS(
            this.match.scheduledTime.startTime
          );
          this.suffix = this.util.getSuffixFromMS(
            this.match.scheduledTime.startTime
          );
        }
      },
      err => {
        console.log(err);
      }
    );
    for (let i = 1; i < 13; i++) {
      for (let j = 0; j <= 3; j++) {
        let min: any = j * 15;
        if (min == 0) {
          min = "00";
        }
        let time = i + ":" + min;
        this.times.push(time);
      }
    }
    this.mvpServ.getMvpById("match_id", this.matchId).subscribe(
      res => {
        if(res){
          this.mvpObj = res;
        }
      },
      err => {
        console.log("err", err);
      }
    );
  }

  saveMVP(obj) {
    if (obj.potg_link) {
      let valObj = this.util.validateClipUrl(obj.potg_link);
      if (valObj.valid) {
        obj.potg_link = valObj.returnClip;
        this.mvpServ.upsertMvp(obj).subscribe(
          res => {
            this.mvpObj = res;
          },
          err => {
            console.log("MVP Submit: ", err);
          }
        );
      }
    } else {
      this.mvpServ.upsertMvp(obj).subscribe(
        res => {
          this.mvpObj = res;
        },
        err => {
          console.log("MVP Submit: ", err);
        }
      );
    }
  }

  deleteReplay(key) {
    this.adminService.deleteReplay(this.match.matchId, key).subscribe(
      res=>{
        this.ngOnInit();
      },
      err=>{
        console.log(err);
      }
    )
  }

  uploadReplay() {
    if(this.util.returnBoolByPath(this.match, `replays.${this.matchRound}`)){
      alert('This match all ready has info for the provided round!');
    }else{
      if (this.util.returnBoolByPath(this.match, `other.${this.matchRound}`)){
        this.match.other[this.matchRound].winner = this.winner;
      }else{
        if(!this.util.returnBoolByPath(this.match, 'other')){
          this.match.other = {};
        }
        this.match.other[this.matchRound] = { winner : this.winner };
      }

      this.adminService.matchUpdate(this.match).subscribe(
        res => {
          //now lets do some replay magic...
          let report = { "matchId":this.match.matchId, "round": this.matchRound}
          report[`replay${this.matchRound}`] = this.filePendingUpload;
          this.adminService.uploadReplay(report).subscribe(
            res=>{
              this.filePendingUpload = null;
              this.matchRound = null;
              this.winner = null;
              this.ngOnInit();
            },
            err=>{
              console.log(err);

            }
          )
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  saveMatch(match) {
    let submittable = true;

    if (this.homeScore != undefined && this.homeScore != null) {
      match.home.score = this.homeScore;
    }

    if (this.awayScore != undefined && this.awayScore != null) {
      match.away.score = this.awayScore;
    }

    if (this.match.scheduledTime.startTime && this.friendlyTime) {
      this.friendlyDate = moment(this.match.scheduledTime.startTime);

      let msDate = this.util.returnMSFromFriendlyDateTime(
        this.friendlyDate,
        this.friendlyTime,
        this.suffix
      );

      let endDate = msDate + 5400000;
      match.scheduledTime.startTime = msDate;
      match.scheduledTime.endTime = endDate;
    }

    if (submittable) {
      this.adminService.matchUpdate(match).subscribe(
        res => {
          this.ngOnInit();
        },
        err => {
          console.log(err);
        }
      );
    }
  }
}
