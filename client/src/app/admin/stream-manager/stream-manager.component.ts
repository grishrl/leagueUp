import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { UtilitiesService } from 'src/app/services/utilities.service';
import { AdminService } from 'src/app/services/admin.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: "app-stream-manager",
  templateUrl: "./stream-manager.component.html",
  styleUrls: ["./stream-manager.component.css"]
})
export class StreamManagerComponent implements OnInit {
  constructor(
    public util: UtilitiesService,
    private admin: AdminService,
    private scheduleService: ScheduleService
  ) {}

  friendlyDate;
  friendlyTime;
  friendlySuffix;
  startNow: false;
  times = [];
  amPm = ["PM", "AM"];

  stream = {
    team1Name:'',
    team2Name:'',
    title: "",
    casterName: "",
    casterUrl: "",
    runTime:90
  };

  streams = [];

  ngOnInit(): void {

    let query = { streamOnly: true };
    this.scheduleService.matchQuery(query).subscribe(
      res => {

        this.streams = res;
        console.log(this.streams)
      },
      err => {
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
  }

  saveStream() {
    if (this.startNow) {
      this.stream["startNow"] = true;
    } else if (this.friendlyDate && this.friendlyTime) {
      this.friendlyDate = moment(this.friendlyDate);

      let msDate = this.util.returnMSFromFriendlyDateTime(
        this.friendlyDate,
        this.friendlyTime,
        this.friendlySuffix
      );
      // this.stream["scheduledTime"] = {};
      this.stream['startTime'] = msDate;
    }

    // delete this.eventOrig["_id"];
    // delete this.event["_id"];

    //save the event
    let submit = true;

    if (submit) {
      this.admin.createStream(this.stream).subscribe(
        res => {
          this.ngOnInit();
        },
        err => {
          console.warn(err);
        }
      );
    }
  }

  deleteStream(id){
    this.admin.deleteStream(id).subscribe(
      res=>
      {
        this.ngOnInit();
      },
      err=>{
        console.warn(err);
      }
    )
  }
}
