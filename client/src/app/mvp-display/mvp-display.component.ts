import { Component, OnInit } from '@angular/core';
import { MvpService } from '../services/mvp.service';
import { ScheduleService } from '../services/schedule.service';
import { find } from 'lodash';
import { TimeserviceService } from '../services/timeservice.service';

@Component({
  selector: "app-mvp-display",
  templateUrl: "./mvp-display.component.html",
  styleUrls: ["./mvp-display.component.css"]
})
export class MvpDisplayComponent implements OnInit {
  constructor(
    private scheduleService: ScheduleService,
    private mvpService: MvpService,
    private timeService:TimeserviceService
  ) {
    this.timeService.getSesasonInfo().subscribe((res) => {
      console.log("res>>", res);
      this.currentSeason = res["value"];
    });
  }

  currentSeason;

  display = [];
  ngOnInit(): void {

    this.mvpService.getBySeason(this.currentSeason).subscribe(
      res => {
        let reportedMvps=res;
        let arrayBounds = reportedMvps.length > 10 ? 10 : reportedMvps.length;
                for (let i = 0; i < arrayBounds; i++) {
                  this.display.push(reportedMvps[i]);
                }
      }
    )

    // this.scheduleService.getReportedMatches("des", 20, false).subscribe(
    //   res => {
    //     let matches = res;
    //     let matchIds = [];
    //     matches.forEach(m=>{
    //       matchIds.push(m.matchId);
    //     });
    //     let comboData = [];
    //     this.mvpService.getMvpByList('match_id', matchIds).subscribe(
    //       res=>{
    //         let reportedMvps = res;
    //         let arrayBounds = reportedMvps.length > 10 ? 10 : reportedMvps.length;
    //         for (let i = 0; i < arrayBounds; i++) {
    //           let coorespondingMatch = find(matches, {
    //             matchId: reportedMvps[i].match_id
    //           });
    //           let to = { potg: reportedMvps[i], match: coorespondingMatch };
    //           comboData.push(to);
    //         }
    //         this.display = comboData;
    //         console.log(this.display);
    //       }
    //     )
    //   },
    //   err => {
    //     console.log(err);
    //   }
    // );
  }
}
