import { Component, OnInit } from '@angular/core';
import { TimeserviceService } from 'src/app/services/timeservice.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-replay-casts',
  templateUrl: './replay-casts.component.html',
  styleUrls: ['./replay-casts.component.css']
})
export class ReplayCastsComponent implements OnInit {

  currentSeason;
  unCastedMatches;
  constructor(private timeService:TimeserviceService, private scheduleService:ScheduleService) {
        this.timeService.getSesasonInfo().subscribe((res) => {
          this.currentSeason = res["value"];
          this.initSchedule();
        });
   }

  ngOnInit(): void {
  }

  initSchedule(){
    let query = {
      $and: [
        {
          season: this.currentSeason,
        },
        {
          reported: true,
        },
        {
          $or: [
            {
              forfeit: {
                $exists: false,
              },
            },
            {
              forfiet: false,
            },
          ],
        },
        {
          casterName: {
            $exists: false,
          },
        },
      ],
    };
    this.scheduleService.matchQuery(query).subscribe(
      res=>{
        this.unCastedMatches=res;
      },
      err=>{
        console.log(err);
      }
    )
  }

}
