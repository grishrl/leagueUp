import { Component, OnInit } from '@angular/core';
import { MvpService } from '../../services/mvp.service';
import { ScheduleService } from '../../services/schedule.service';
import { find } from 'lodash';
import { TimeService } from '../../services/time.service';

@Component({
  selector: "app-mvp-display",
  templateUrl: "./mvp-display.component.html",
  styleUrls: ["./mvp-display.component.css"]
})
export class MvpDisplayComponent implements OnInit {
  constructor(
    private scheduleService: ScheduleService,
    private mvpService: MvpService,
    private timeService:TimeService
  ) {
    this.timeService.getSesasonInfo().subscribe((res) => {
      this.currentSeason = res["value"];
      this.initMvps();
    });
  }

  currentSeason;

  display = [];

  initMvps(){
        this.mvpService.getBySeason(this.currentSeason).subscribe((res) => {
          let reportedMvps = res;
          reportedMvps.sort( (a,b)=>{
            return a.timeStamp>b.timeStamp ? -1 : 1;
          })
          let tempArr = [];
          let arrayBounds = reportedMvps.length > 10 ? 10 : reportedMvps.length;
          for (let i = 0; i < arrayBounds; i++) {
            tempArr.push(reportedMvps[i]);
          }
          let matchList = [];
          tempArr.forEach( (mvp)=>{
            matchList.push(mvp.match_id);
          });
          let displayArray = [];
          this.scheduleService.getMatchList(matchList).subscribe(
            res=>{
              res.forEach(match=>{
                  tempArr.forEach(
                    (mvp)=>{
                      if(match.matchId == mvp.match_id){
                        displayArray.push({mvp, match});
                      }
                    });
                });
                this.display = displayArray;
            });

        });
  }

  ngOnInit(): void {



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
