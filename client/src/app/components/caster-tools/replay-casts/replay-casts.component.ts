import { Component, OnInit } from '@angular/core';
import { TimeService } from 'src/app/services/time.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-replay-casts',
  templateUrl: './replay-casts.component.html',
  styleUrls: ['./replay-casts.component.css']
})
export class ReplayCastsComponent implements OnInit {

  currentSeason;
  unCastedMatches;
  constructor(private timeService:TimeService, private scheduleService:ScheduleService, private util:UtilitiesService) {
        this.timeService.getSesasonInfo().subscribe((res) => {
          this.currentSeason = res.value;
          this.initSchedule();
        });
   }

  ngOnInit(): void {
  }

  initSchedule(){
    let query = {
      $and: [
        { season: this.currentSeason },
        { reported: true },
        { $or: [{ forfeit: { $exists: false } }, { forfeit: false }] },
        { $or: [{ casterName: { $exists: false } }, { casterName: "" }] },
      ],
    };
    this.scheduleService.matchQuery(query).subscribe(
      res=>{
        // res = this.util.sortMatchesByTime(res);
        this.unCastedMatches=res;
      },
      err=>{
        console.warn(err);
      }
    )
  }

}
