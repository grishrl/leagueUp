import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ScheduleService } from 'src/app/services/schedule.service';
import { AdminService } from 'src/app/services/admin.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: "app-caster-inputs",
  templateUrl: "./caster-inputs.component.html",
  styleUrls: ["./caster-inputs.component.css"],
})
export class CasterInputsComponent implements OnInit {
  constructor(private scheduleService: ScheduleService, private admin:AdminService, private user:UserService, private auth:AuthService) {}

  hideForm = true;
  _id: string;

  name: string;
  URL: string;

  @Input() set matchId(id) {
    if (id != null && id != undefined) {
      this._id = id;
    }
  }

  recMatch;
  @Input() set match(_match) {
    if (_match != null && _match != undefined) {
      this.recMatch = _match;
    }
  }

  @Output() matchChange = new EventEmitter();

  casterNameControl = new FormControl("", [Validators.required]);
  casterUrlControl = new FormControl("", [Validators.required]);
  casterInputForm = new FormGroup({
    name: this.casterNameControl,
    url: this.casterUrlControl,
  });

  @Input() replay = false;

  @Input() replayCastTime;

  ngOnInit() {

  }

  claimMatch() {
    if(this.replay){
          this.user.getUser(this.auth.getUser()).subscribe((res) => {
            let casterName = res['casterName'];
            let casterUrl = res['twitch'];
            if (casterName && casterUrl) {
              let stream = {};
              stream["title"] = `Replay Cast:`; // ${this.recMatch.home.teamName} vs ${this.recMatch.away.teamName}
              stream["startTime"] = this.replayCastTime;
              stream["casterName"] = casterName;
              stream["casterUrl"] = casterUrl;
              stream["team1Name"] = this.recMatch.home.teamName;
              stream["team2Name"] = this.recMatch.away.teamName;
              if (this.replayCastTime) {
                this.admin.createStream(stream).subscribe(
                  (res) => {
                    // now set the match as casted by this caster for repotings
                    this.scheduleService
                      .addCaster(this.recMatch.matchId, casterName, casterUrl)
                      .subscribe(
                        (res) => {
                          this.recMatch = res;
                          this.matchChange.emit(this.recMatch);
                          this.hideForm = true;
                        },
                        (err) => {
                          console.log(err);
                        }
                      );
                  },
                  (err) => {
                    console.warn(err);
                  }
                );
              } else {
                alert("You need to set up One Click Claim to do this.");
              }
            } else {
              alert("Replay cast time required!");
            }
          });
    }else{
          this.scheduleService.addCasterOcc(this._id).subscribe(
            (res) => {
              this.matchChange.emit(res);
              this.ngOnInit();
            },
            (err) => {
              console.log(err);
            }
          );
    }

  }

  saveCasterInfo(casterName, casterUrl) {
    let matchId;
    console.log(this.recMatch, this._id, this.replayCastTime);
    if (this._id != null && this._id != undefined) {
      matchId = this._id;
      if (casterName != null && casterName != undefined) {
        if (casterUrl != null && casterUrl != undefined) {
          if(this.replay){
            let stream = {};
            stream["title"] = `Replay Cast:`; // ${this.recMatch.home.teamName} vs ${this.recMatch.away.teamName}
            stream["startTime"] = this.replayCastTime;
            stream["casterName"] = casterName;
            stream["casterUrl"] = casterUrl;
            stream["team1Name"] = this.recMatch.home.teamName;
            stream["team2Name"] = this.recMatch.away.teamName;
            if (this.replayCastTime) {
              this.admin.createStream(stream).subscribe(
                (res) => {
                  // now set the match as casted by this caster for repotings
                  this.scheduleService
                    .addCaster(matchId, casterName, casterUrl)
                    .subscribe(
                      (res) => {
                        this.recMatch = res;
                        this.matchChange.emit(this.recMatch);
                        this.hideForm = true;
                      },
                      (err) => {
                        console.log(err);
                      }
                    );
                },
                (err) => {
                  console.warn(err);
                }
              );
            } else {
              alert("Replay cast time required!");
            }
                         }else{
            this.scheduleService
              .addCaster(matchId, casterName, casterUrl)
              .subscribe(
                (res) => {
                  this.recMatch = res;
                  this.matchChange.emit(this.recMatch);
                  this.hideForm = true;
                },
                (err) => {
                  console.log(err);
                }
              );
          }
        } else {
          alert("Null Caster Url");
        }
      } else {
        alert("Null Caster Name");
      }
    } else {
      alert("Null MatchId");
    }
  }
}
