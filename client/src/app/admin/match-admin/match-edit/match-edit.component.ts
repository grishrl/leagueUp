import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { UtilitiesService } from 'src/app/services/utilities.service';
import * as moment from 'moment-timezone';
import { Match } from '../../../classes/match.class';
import { MvpService } from 'src/app/services/mvp.service';
import { forEach } from 'lodash';
import { S3uploadService } from 'src/app/services/s3upload.service';
import { timeout } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: "app-match-edit",
  templateUrl: "./match-edit.component.html",
  styleUrls: ["./match-edit.component.css"],
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
    potg_link: "",
  };
  filePendingUpload;
  matchRound;
  winner;

  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private adminService: AdminService,
    private util: UtilitiesService,
    private mvpServ: MvpService,
    private s3uploads: S3uploadService,
    private team: TeamService
  ) {
    if (this.route.snapshot.params["id"]) {
      this.matchId = this.route.snapshot.params["id"];
    }
  }

  ngOnInit() {
    if(Object.keys(this.match.replays).length == 0){
      this.match.replays['1']={ data:'',parsedUrl:'',url:'' }
    }
    this.scheduleService.getMatchInfo(this.matchId).subscribe(
      (res) => {
        if(this.util.returnBoolByPath(res, 'other')==false){
          res.other = {};
        }
        this.match = res;
        if (this.util.returnByPath(res, "other.team_one_player")) {
          this.homeTeamPlayer = this.util.returnByPath(
            res,
            "other.team_one_player"
          );
        }
        if (this.util.returnByPath(res, "other.team_two_player")) {
          this.awayTeamPlayer = this.util.returnByPath(
            res,
            "other.team_two_player"
          );
        }

        if (this.util.returnBoolByPath(this.match, "away.score")) {
          this.awayScore = this.match.away.score;
        }

        if (this.util.returnBoolByPath(this.match, "home.score")) {
          this.homeScore = this.match.home.score;
        }
        if (!this.match.hasOwnProperty("scheduledTime")) {
          this.match.scheduledTime = {
            startTime: null,
            endTime: null,
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
        this.initTeams();
      },
      (err) => {
        console.warn(err);
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
      (res) => {
        if (res) {
          this.mvpObj = res;
        }
      },
      (err) => {
        console.warn("err", err);
      }
    );
  }

  saveMVP(obj) {
    if (obj.potg_link) {
      let valObj = this.util.twitchEmbeddify(obj.potg_link);

      if (valObj.valid) {
        obj.potg_link = valObj.returnClip;
        obj.match_id = this.matchId;
        this.adminService.upsertMvp(obj).subscribe(
          (res) => {
            this.mvpObj = res;
          },
          (err) => {
            console.warn("MVP Submit: ", err);
          }
        );
      }
    } else {
      this.adminService.upsertMvp(obj).subscribe(
        (res) => {
          this.mvpObj = res;
        },
        (err) => {
          console.warn("MVP Submit: ", err);
        }
      );
    }
  }

  awayTeam = { teamMembers: [] };
  homeTeam = { teamMembers: [] };

  private initTeams() {
    this.team.getTeam(this.match.away.teamName).subscribe(
      (res) => {
        this.awayTeam = res;
        // this.awayLogo = this.team.imageFQDN(this.awayTeam.logo);
        // this.allPlayers = this.allPlayers.concat(this.awayTeam.teamMembers);
      },
      (err) => {
        console.warn(err);
      }
    );
    this.team.getTeam(this.match.home.teamName).subscribe(
      (res) => {
        this.homeTeam = res;
        // this.awayLogo = this.team.imageFQDN(this.awayTeam.logo);
        // this.allPlayers = this.allPlayers.concat(this.awayTeam.teamMembers);
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  deleteReplay(key) {
    this.adminService.deleteReplay(this.match.matchId, key).subscribe(
      (res) => {
        this.ngOnInit();
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  uploadReplay() {
    let report = {
      matchId: this.match.matchId,
    };
    //check if we're over writing some round info
    if (this.util.returnBoolByPath(this.match, `replays.${this.matchRound}`)) {
      alert("This match all ready has info for the provided round!");
    } else {
      //round is clear.
      // set up winner in the other object;
      if (
        this.util.returnBoolByPath(report, `otherDetails.${this.matchRound}`)
      ) {
        report["otherDetails"][this.matchRound].winner = this.winner;
      } else {
        if (!this.util.returnBoolByPath(report, "otherDetails")) {
          report["otherDetails"] = {};
        }
        report["otherDetails"][this.matchRound] = { winner: this.winner };
      }
      let inf = {
        fileInfo: {
          filename: this.filePendingUpload.name,
          type: this.filePendingUpload.type,
        },
      };
      this.uploading = true;
      this.s3uploads.getSignedUrl(inf).subscribe(
        (signedObj) => {

          report["fileTracking"] = {};
          report["fileTracking"][this.matchRound] = {};
          report["fileTracking"][this.matchRound]["filename"] =
            signedObj[0].file;

          this.s3uploads
            .s3put(signedObj[0].signedUrl, this.filePendingUpload)
            .subscribe(
              (uploaded) => {
                this.adminService.uploadReplay(report).subscribe(
                  (res) => {
                    this.filePendingUpload = null;
                    this.matchRound = null;
                    this.winner = null;

                    setTimeout(() => {
                      this.uploading = false;
                      this.ngOnInit();
                    }, 3000);
                    // this.ngOnInit();
                  },
                  (err) => {
                    console.warn(err);
                  }
                );
              },
              (err) => {
                console.warn(err);
              }
            );
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  homeTeamPlayer;
  awayTeamPlayer;

  saveMatch(match) {
    let submittable = true;

    if (this.homeScore != undefined && this.homeScore != null) {
      match.home.score = this.homeScore;
    }

    if (this.awayScore != undefined && this.awayScore != null) {
      match.away.score = this.awayScore;
    }

    if (this.homeTeamPlayer != undefined && this.homeTeamPlayer != null) {
      match.other.homeTeamPlayer = this.homeTeamPlayer;
      match.other.team_one_player = this.homeTeamPlayer;
    }

    if (this.awayTeamPlayer != undefined && this.awayTeamPlayer != null) {
      match.other.awayTeamPlayer = this.awayTeamPlayer;
      match.other.team_two_player = this.awayTeamPlayer;
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
        (res) => {
          this.ngOnInit();
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }
}
